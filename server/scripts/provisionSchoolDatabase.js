require("dotenv").config();

const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");
const { getDatabaseConfig } = require("../config/databaseConfig");
const centralPool = require("../config/database");

const IDENTIFIER_PATTERN = /^[A-Za-z0-9_]+$/;
const DATABASE_ROOT = path.resolve(__dirname, "../database");

// These migrations either create platform-wide objects, the central registry,
// or copy legacy shared-database data. They must never be replayed against a
// fresh isolated school database.
const EXCLUDED_MIGRATIONS = new Set([
    "20260830_backfill_school_academic_data.sql",
    "20260911_add_eduprow_partner_program.sql",
    "20260911_add_partner_lead_converted_at.sql",
    "20260911_harden_partner_state_transitions.sql",
    "20260911_link_partner_leads_to_schools.sql",
    "20260911_add_school_database_registry.sql",
    "20260911_school_database_registry.sql",
]);

const quoteIdentifier = (value) => {
    if (!IDENTIFIER_PATTERN.test(value)) {
        throw new Error(`Unsafe PostgreSQL identifier: ${value}`);
    }
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
    const excluded = options.excluded || new Set();

    for (const file of files) {
        if (excluded.has(file)) continue;

        const sql = await fs.readFile(path.join(directory, file), "utf8");
        if (!sql.trim()) continue;

        console.log(`Applying ${path.basename(directory)}/${file}`);
        await client.query(sql);
    }
};

const getSchool = async (schoolId) => {
    const result = await centralPool.query(`
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
    `, [schoolId]);

    return result.rows[0] || null;
};

const getSchoolAdministrators = async (schoolId) => {
    const result = await centralPool.query(`
        SELECT
            u.id,
            u.username,
            u.email,
            u.password,
            u.is_active,
            r.role_name
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE u.school_id = $1
          AND LOWER(r.role_name) IN ('admin', 'administrator', 'principal', 'super admin')
        ORDER BY u.id
    `, [schoolId]);

    return result.rows;
};

const getRegistryEntry = async (schoolId) => {
    const result = await centralPool.query(`
        SELECT school_id, database_name, website_slug, is_active
        FROM school_database_registry
        WHERE school_id = $1
        LIMIT 1
    `, [schoolId]);

    return result.rows[0] || null;
};

const createDatabaseIfNeeded = async (databaseName) => {
    const maintenancePool = new Pool(getDatabaseConfig("postgres"));

    try {
        const existsResult = await maintenancePool.query(
            "SELECT 1 FROM pg_database WHERE datname = $1 LIMIT 1",
            [databaseName]
        );

        if (!existsResult.rowCount) {
            await maintenancePool.query(`CREATE DATABASE ${quoteIdentifier(databaseName)} TEMPLATE template0`);
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
    await client.query(`
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
    ]);

    await client.query(`
        INSERT INTO school_settings (
            school_id,
            school_name,
            website_slug,
            admission_prefix,
            school_email,
            school_phone,
            school_address,
            school_motto,
            school_level,
            is_active,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
    ]);

    await client.query(`
        SELECT setval(
            pg_get_serial_sequence('schools', 'id'),
            GREATEST((SELECT COALESCE(MAX(id), 1) FROM schools), 1),
            TRUE
        )
    `);
};

const seedAdministrators = async (client, administrators, schoolId) => {
    for (const administrator of administrators) {
        const roleResult = await client.query(
            `SELECT id FROM roles WHERE LOWER(role_name) = LOWER($1) LIMIT 1`,
            [administrator.role_name]
        );

        const fallbackRole = roleResult.rows[0] || (await client.query(
            `SELECT id FROM roles WHERE LOWER(role_name) = 'admin' LIMIT 1`
        )).rows[0];

        if (!fallbackRole) {
            throw new Error("No administrator role is available in the school database.");
        }

        await client.query(`
            INSERT INTO users (
                id, username, email, password, role_id, school_id, is_active
            )
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
        ]);
    }

    await client.query(`
        SELECT setval(
            pg_get_serial_sequence('users', 'id'),
            GREATEST((SELECT COALESCE(MAX(id), 1) FROM users), 1),
            TRUE
        )
    `);
};

const seedDefaultWebsitePages = async (client, schoolId) => {
    await client.query(`
        INSERT INTO website_pages (
            school_id,
            page_slug,
            page_title,
            page_content,
            meta_title,
            meta_description,
            is_published
        )
        SELECT
            $1,
            defaults.page_slug,
            defaults.page_title,
            defaults.page_content,
            defaults.meta_title,
            defaults.meta_description,
            TRUE
        FROM (
            VALUES
                ('home', 'Welcome to Our School', 'We are committed to providing quality education and helping every learner grow in knowledge, character and confidence.', 'Home', 'Welcome to our school.'),
                ('about', 'About Us', 'Learn more about our school, our values and our commitment to providing a supportive learning environment.', 'About Us', 'Learn more about our school.'),
                ('academics', 'Academics', 'Explore our academic programmes and the learning opportunities available to our students.', 'Academics', 'Explore our academic programmes.'),
                ('admissions', 'Admissions', 'Learn about our admission process and how to begin your journey with our school.', 'Admissions', 'Learn about our admission process.'),
                ('contact', 'Contact Us', 'Get in touch with our school for enquiries, admissions and other information.', 'Contact Us', 'Get in touch with our school.'),
                ('news', 'News', 'Stay updated with the latest news, announcements and stories from our school.', 'School News', 'Read the latest news and announcements from our school.'),
                ('gallery', 'Gallery', 'Explore photos and memorable moments from our school community, activities and events.', 'School Gallery', 'Explore our school gallery.'),
                ('events', 'Events', 'Discover upcoming school events, activities and important dates.', 'School Events', 'View upcoming school events.')
        ) AS defaults(
            page_slug,
            page_title,
            page_content,
            meta_title,
            meta_description
        )
        WHERE NOT EXISTS (
            SELECT 1
            FROM website_pages existing
            WHERE existing.school_id = $1
              AND LOWER(existing.page_slug) = LOWER(defaults.page_slug)
        );
    `, [schoolId]);
};

const verifySchoolDatabase = async (client, schoolId) => {
    const result = await client.query(`
        SELECT
            current_database() AS database_name,
            EXISTS (SELECT 1 FROM schools WHERE id = $1) AS school_exists,
            EXISTS (SELECT 1 FROM school_settings WHERE school_id = $1 AND is_active = TRUE) AS settings_exist,
            EXISTS (SELECT 1 FROM users WHERE school_id = $1) AS school_users_exist,
            EXISTS (SELECT 1 FROM roles WHERE LOWER(role_name) IN ('admin', 'administrator')) AS admin_role_exists,
            EXISTS (SELECT 1 FROM website_pages WHERE school_id = $1 AND page_slug = 'home') AS website_pages_exist,
            to_regclass('public.cbt_exams') IS NOT NULL AS cbt_schema_exists
    `, [schoolId]);

    const verification = result.rows[0];
    const failed = Object.entries(verification)
        .filter(([key, value]) => ["school_exists", "settings_exist", "school_users_exist", "admin_role_exists", "website_pages_exist", "cbt_schema_exists"].includes(key) && !value)
        .map(([key]) => key);

    if (failed.length) {
        throw new Error(`School database verification failed: ${failed.join(", ")}`);
    }

    return verification;
};

const provision = async (schoolId) => {
    if (!Number.isInteger(schoolId) || schoolId < 1) {
        throw new Error("Usage: node scripts/provisionSchoolDatabase.js <schoolId>");
    }

    const registry = await getRegistryEntry(schoolId);
    if (!registry) {
        throw new Error(`School ${schoolId} has no central database registry entry.`);
    }

    const school = await getSchool(schoolId);
    if (!school) {
        throw new Error(`School ${schoolId} does not exist in the central schools table.`);
    }

    const administrators = await getSchoolAdministrators(schoolId);
    if (!administrators.length) {
        throw new Error(`School ${schoolId} has no administrator account to seed into its dedicated database.`);
    }

    const databaseName = registry.database_name;
    quoteIdentifier(databaseName);

    const databaseCreated = await createDatabaseIfNeeded(databaseName);
    const schoolPool = new Pool(getDatabaseConfig(databaseName));

    try {
        const client = await schoolPool.connect();
        try {
            // The schools table is intentionally created before repository
            // migrations because several legacy migrations reference it.
            // We then seed this school before those migrations run, so a
            // fresh isolated database has the school context they expect.
            await client.query(`
                CREATE TABLE IF NOT EXISTS schools (
                    id INTEGER PRIMARY KEY,
                    school_name VARCHAR(150) NOT NULL,
                    school_code VARCHAR(20),
                    email VARCHAR(100),
                    phone VARCHAR(20),
                    address TEXT,
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await executeDirectory(client, path.join(DATABASE_ROOT, "schema"));
            await seedSchool(client, school);
            await executeDirectory(client, path.join(DATABASE_ROOT, "migrations"), {
                excluded: EXCLUDED_MIGRATIONS,
            });

            await client.query(`
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
            `);

            // Re-apply settings after migrations because the settings migration
            // may create the row with only its legacy/default columns.
            await seedSchool(client, school);
            await seedAdministrators(client, administrators, school.id);
            await seedDefaultWebsitePages(client, school.id);

            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_school_settings_website_slug
                ON school_settings (LOWER(website_slug))
            `);

            await verifySchoolDatabase(client, schoolId);
        } finally {
            client.release();
        }
    } catch (error) {
        if (databaseCreated) {
            console.error(`Initialization failed for ${databaseName}. The database was left inactive for inspection.`);
        }
        throw error;
    } finally {
        await schoolPool.end();
    }

    await centralPool.query(`
        UPDATE school_database_registry
        SET is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
        WHERE school_id = $1
          AND database_name = $2
    `, [schoolId, databaseName]);

    console.log(JSON.stringify({
        success: true,
        schoolId,
        databaseName,
        databaseCreated,
        active: true,
        message: "Dedicated school database initialized and activated.",
    }, null, 2));
};

const schoolId = Number(process.argv[2]);

provision(schoolId)
    .catch((error) => {
        console.error("School database provisioning failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await centralPool.end();
    });
