require("dotenv").config();

const fs = require("node:fs/promises");
const path = require("node:path");
const zlib = require("node:zlib");
const { promisify } = require("node:util");
const { Pool } = require("pg");
const { getDatabaseConfig } = require("../config/databaseConfig");
const centralPool = require("../config/database");

const IDENTIFIER_PATTERN = /^[A-Za-z0-9_]+$/;
const DATABASE_ROOT = path.resolve(__dirname, "../database");
const BOOTSTRAP_FILE = path.join(DATABASE_ROOT, "bootstrap", "current_school_schema.sql.gz.b64");
const BASELINE_CUTOFF = "20260912_sync_current_school_settings.sql";
const RETRYABLE_DB_ERRORS = new Set(["EAI_AGAIN", "ECONNRESET", "ETIMEDOUT", "ECONNREFUSED"]);
const DB_RETRY_ATTEMPTS = 5;
const DB_RETRY_DELAY_MS = 1500;
const gunzip = promisify(zlib.gunzip);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withDatabaseRetry = async (operation, label = "database operation") => {
    let lastError;
    for (let attempt = 1; attempt <= DB_RETRY_ATTEMPTS; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (!RETRYABLE_DB_ERRORS.has(error?.code) || attempt === DB_RETRY_ATTEMPTS) throw error;
            console.warn(`${label} failed with ${error.code}. Retrying (${attempt}/${DB_RETRY_ATTEMPTS - 1})...`);
            await sleep(DB_RETRY_DELAY_MS * attempt);
        }
    }
    throw lastError;
};

const quoteIdentifier = (value) => {
    if (!IDENTIFIER_PATTERN.test(value)) throw new Error(`Unsafe PostgreSQL identifier: ${value}`);
    return `"${value}"`;
};

const listSqlFiles = async (directory) => {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};

const executeDirectory = async (client, directory, options = {}) => {
    const files = await listSqlFiles(directory);
    const predicate = options.predicate || (() => true);
    for (const file of files) {
        if (!predicate(file)) continue;
        const sql = await fs.readFile(path.join(directory, file), "utf8");
        if (!sql.trim()) continue;
        console.log(`Applying ${path.basename(directory)}/${file}`);
        await withDatabaseRetry(() => client.query(sql), `Applying ${file}`);
    }
};

const applyCurrentMigrations = async (client) => {
    await executeDirectory(client, path.join(DATABASE_ROOT, "migrations"), {
        predicate: (file) => file > BASELINE_CUTOFF,
    });
};

const applyCurrentRepairMigrations = async (client) => {
    await executeDirectory(client, path.join(DATABASE_ROOT, "migrations"), {
        predicate: (file) => file >= BASELINE_CUTOFF,
    });
};

const applyCurrentSchoolBootstrap = async (client) => {
    const encoded = await fs.readFile(BOOTSTRAP_FILE, "utf8");
    const compressed = Buffer.from(encoded.trim(), "base64");
    const sql = (await gunzip(compressed)).toString("utf8");
    if (!sql.trim()) throw new Error("Current school database bootstrap is empty.");
    console.log("Applying current isolated-school database bootstrap");
    await withDatabaseRetry(() => client.query(sql), "Applying school database bootstrap");
};

const getSchool = async (schoolId) => {
    const result = await withDatabaseRetry(() => centralPool.query(`
        SELECT
            s.id,
            s.school_name,
            s.school_code,
            s.email,
            s.phone,
            s.address,
            ss.website_slug,
            ss.admission_prefix,
            ss.school_email,
            ss.school_phone,
            ss.school_address,
            ss.school_motto,
            ss.school_level
        FROM schools s
        LEFT JOIN school_settings ss ON ss.school_id = s.id
        WHERE s.id = $1
        LIMIT 1
    `, [schoolId]), "Loading school");
    return result.rows[0] || null;
};

const getSchoolAdministrators = async (schoolId) => {
    const result = await withDatabaseRetry(() => centralPool.query(`
        SELECT u.id, u.username, u.email, u.password, u.is_active, r.role_name
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE u.school_id = $1
          AND LOWER(r.role_name) IN ('admin', 'administrator', 'principal', 'super admin')
        ORDER BY u.id
    `, [schoolId]), "Loading school administrators");
    return result.rows;
};

const getRegistryEntry = async (schoolId) => {
    const result = await withDatabaseRetry(() => centralPool.query(`
        SELECT school_id, database_name, website_slug, is_active
        FROM school_database_registry
        WHERE school_id = $1
        LIMIT 1
    `, [schoolId]), "Loading school database registry");
    return result.rows[0] || null;
};

const createDatabaseIfNeeded = async (databaseName) => {
    const maintenancePool = new Pool(getDatabaseConfig("postgres"));
    try {
        const existsResult = await withDatabaseRetry(
            () => maintenancePool.query("SELECT 1 FROM pg_database WHERE datname = $1 LIMIT 1", [databaseName]),
            "Checking school database"
        );
        if (!existsResult.rowCount) {
            await withDatabaseRetry(
                () => maintenancePool.query(`CREATE DATABASE ${quoteIdentifier(databaseName)} TEMPLATE template0`),
                "Creating school database"
            );
            console.log(`Created database: ${databaseName}`);
            return true;
        }
        console.log(`Database already exists: ${databaseName}`);
        return false;
    } finally {
        await maintenancePool.end();
    }
};

const seedSchool = async (client, school) => {
    await withDatabaseRetry(() => client.query(`
        INSERT INTO schools (id, school_name, school_code, email, phone, address, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, TRUE)
        ON CONFLICT (id) DO UPDATE SET
            school_name = EXCLUDED.school_name,
            school_code = EXCLUDED.school_code,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            address = EXCLUDED.address,
            is_active = TRUE
    `, [
        school.id,
        school.school_name,
        school.school_code || school.admission_prefix || `SCH${school.id}`,
        school.email || school.school_email || null,
        school.phone || school.school_phone || null,
        school.address || school.school_address || null,
    ]), "Seeding school");

    await withDatabaseRetry(() => client.query(`
        INSERT INTO school_settings (
            school_id, school_name, website_slug, admission_prefix,
            school_email, school_phone, school_address, school_motto,
            school_level, is_active, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (school_id) DO UPDATE SET
            school_name = EXCLUDED.school_name,
            website_slug = EXCLUDED.website_slug,
            admission_prefix = EXCLUDED.admission_prefix,
            school_email = EXCLUDED.school_email,
            school_phone = EXCLUDED.school_phone,
            school_address = EXCLUDED.school_address,
            school_motto = EXCLUDED.school_motto,
            school_level = EXCLUDED.school_level,
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
    `, [
        school.id,
        school.school_name,
        school.website_slug || `school-${school.id}`,
        school.admission_prefix || school.school_code || `SCH${school.id}`,
        school.school_email || school.email || null,
        school.school_phone || school.phone || null,
        school.school_address || school.address || null,
        school.school_motto || null,
        school.school_level || null,
    ]), "Seeding school settings");

    await withDatabaseRetry(() => client.query(`
        SELECT setval(pg_get_serial_sequence('schools', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM schools), 1), TRUE)
    `), "Resetting school sequence");
};

const seedRoles = async (client) => {
    await withDatabaseRetry(() => client.query(`
        INSERT INTO roles (role_name, description)
        VALUES
            ('Administrator', 'Full access to the school management system.'),
            ('Admin', 'Full access to the school management system.'),
            ('Teacher', 'Can manage attendance, results and assigned subjects.'),
            ('Parent', 'Can monitor children and view reports.'),
            ('Principal', 'Can supervise academic activities.'),
            ('Vice Principal', 'Can assist the principal with administration.'),
            ('Bursar', 'Can manage school fees and financial records.')
        ON CONFLICT (role_name) DO NOTHING
    `), "Seeding roles");
};

const seedAdministrators = async (client, administrators, schoolId) => {
    for (const administrator of administrators) {
        const roleResult = await withDatabaseRetry(
            () => client.query(`SELECT id FROM roles WHERE LOWER(role_name) = LOWER($1) LIMIT 1`, [administrator.role_name]),
            "Finding administrator role"
        );
        const fallbackRole = roleResult.rows[0] || (await withDatabaseRetry(
            () => client.query(`SELECT id FROM roles WHERE LOWER(role_name) = 'admin' LIMIT 1`),
            "Finding fallback administrator role"
        )).rows[0];
        if (!fallbackRole) throw new Error("No administrator role is available in the school database.");

        await withDatabaseRetry(() => client.query(`
            INSERT INTO users (id, username, email, password, role_id, school_id, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE SET
                username = EXCLUDED.username,
                email = EXCLUDED.email,
                password = EXCLUDED.password,
                role_id = EXCLUDED.role_id,
                school_id = EXCLUDED.school_id,
                is_active = EXCLUDED.is_active,
                updated_at = CURRENT_TIMESTAMP
        `, [
            administrator.id,
            administrator.username,
            administrator.email || null,
            administrator.password,
            fallbackRole.id,
            schoolId,
            administrator.is_active !== false,
        ]), "Seeding administrator");
    }
    await withDatabaseRetry(() => client.query(`
        SELECT setval(pg_get_serial_sequence('users', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM users), 1), TRUE)
    `), "Resetting user sequence");
};

const seedDefaultWebsitePages = async (client, schoolId) => {
    await withDatabaseRetry(() => client.query(`
        INSERT INTO website_pages (school_id, page_slug, page_title, page_content, meta_title, meta_description, is_published)
        SELECT $1, defaults.page_slug, defaults.page_title, defaults.page_content, defaults.meta_title, defaults.meta_description, TRUE
        FROM (VALUES
            ('home', 'Welcome to Our School', 'We are committed to providing quality education and helping every learner grow in knowledge, character and confidence.', 'Home', 'Welcome to our school.'),
            ('about', 'About Us', 'Learn more about our school, our values and our commitment to providing a supportive learning environment.', 'About Us', 'Learn more about our school.'),
            ('academics', 'Academics', 'Explore our academic programmes and the learning opportunities available to our students.', 'Academics', 'Explore our academic programmes.'),
            ('admissions', 'Admissions', 'Learn about our admission process and how to begin your journey with our school.', 'Admissions', 'Learn about our admission process.'),
            ('contact', 'Contact Us', 'Get in touch with our school for enquiries, admissions and other information.', 'Contact Us', 'Get in touch with our school.'),
            ('news', 'News', 'Stay updated with the latest news, announcements and stories from our school.', 'School News', 'Read the latest news and announcements from our school.'),
            ('gallery', 'Gallery', 'Explore photos and memorable moments from our school community, activities and events.', 'School Gallery', 'Explore our school gallery.'),
            ('events', 'Events', 'Discover upcoming school events, activities and important dates.', 'School Events', 'View upcoming school events.')
        ) AS defaults(page_slug, page_title, page_content, meta_title, meta_description)
        WHERE NOT EXISTS (
            SELECT 1 FROM website_pages existing
            WHERE existing.school_id = $1 AND LOWER(existing.page_slug) = LOWER(defaults.page_slug)
        )
    `, [schoolId]), "Seeding website pages");
};

const verifySchoolDatabase = async (client, schoolId) => {
    const result = await withDatabaseRetry(() => client.query(`
        SELECT
            current_database() AS database_name,
            EXISTS (SELECT 1 FROM schools WHERE id = $1) AS school_exists,
            EXISTS (SELECT 1 FROM school_settings WHERE school_id = $1 AND is_active = TRUE) AS settings_exist,
            EXISTS (SELECT 1 FROM users WHERE school_id = $1) AS school_users_exist,
            EXISTS (SELECT 1 FROM roles WHERE LOWER(role_name) IN ('admin', 'administrator')) AS admin_role_exists,
            EXISTS (SELECT 1 FROM website_pages WHERE school_id = $1 AND page_slug = 'home') AS website_pages_exist,
            to_regclass('public.cbt_exams') IS NOT NULL AS cbt_schema_exists
    `, [schoolId]), "Verifying school database");
    const verification = result.rows[0];
    const required = ["school_exists", "settings_exist", "school_users_exist", "admin_role_exists", "website_pages_exist", "cbt_schema_exists"];
    const failed = required.filter((key) => !verification[key]);
    if (failed.length) throw new Error(`School database verification failed: ${failed.join(", ")}`);
    return verification;
};

const provision = async (schoolId) => {
    if (!Number.isInteger(schoolId) || schoolId < 1) throw new Error("Usage: node scripts/provisionSchoolDatabase.js <schoolId>");

    const registry = await getRegistryEntry(schoolId);
    if (!registry) throw new Error(`School ${schoolId} has no central database registry entry.`);
    const school = await getSchool(schoolId);
    if (!school) throw new Error(`School ${schoolId} does not exist in the central schools table.`);
    const administrators = await getSchoolAdministrators(schoolId);
    if (!administrators.length) throw new Error(`School ${schoolId} has no administrator account to seed into its dedicated database.`);

    const databaseName = registry.database_name;
    quoteIdentifier(databaseName);
    const created = await createDatabaseIfNeeded(databaseName);
    const schoolPool = new Pool(getDatabaseConfig(databaseName));

    try {
        const client = await withDatabaseRetry(() => schoolPool.connect(), "Connecting to school database");
        try {
            if (created) {
                await applyCurrentSchoolBootstrap(client);
                await applyCurrentMigrations(client);
            } else {
                // Existing school databases are never rebuilt. Only migrations newer
                // than the current canonical baseline are applied automatically.
                await applyCurrentRepairMigrations(client);
            }

            await seedRoles(client);
            await seedSchool(client, school);
            await seedAdministrators(client, administrators, schoolId);
            await seedDefaultWebsitePages(client, schoolId);

            const verification = await verifySchoolDatabase(client, schoolId);
            console.log("School database provisioned successfully:");
            console.table(verification);
        } finally {
            client.release();
        }
    } finally {
        await schoolPool.end();
    }
};

const schoolId = Number(process.argv[2]);
provision(schoolId)
    .then(async () => {
        await centralPool.end();
    })
    .catch(async (error) => {
        console.error("School database provisioning failed:", error);
        try { await centralPool.end(); } catch {}
        process.exit(1);
    });
