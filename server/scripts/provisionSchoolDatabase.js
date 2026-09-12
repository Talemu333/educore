require("dotenv").config();

const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");
const { getDatabaseConfig } = require("../config/databaseConfig");
const centralPool = require("../config/database");

const IDENTIFIER_PATTERN = /^[A-Za-z0-9_]+$/;
const DATABASE_ROOT = path.resolve(__dirname, "../database");

// These migrations create platform-wide objects or the central registry.
// They must never be copied into an individual school's database.
const EXCLUDED_MIGRATIONS = new Set([
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
    // Keep the central school ID inside its dedicated database. This lets
    // existing school_id values remain stable during the transition.
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

    // The schema's original school_settings table predates school_id. The
    // migrations above add the current columns before this seed runs.
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

    // Keep the sequence ahead of the explicitly preserved school ID.
    await client.query(`
        SELECT setval(
            pg_get_serial_sequence('schools', 'id'),
            GREATEST((SELECT COALESCE(MAX(id), 1) FROM schools), 1),
            TRUE
        )
    `);
};

const verifySchoolDatabase = async (client, schoolId) => {
    const result = await client.query(`
        SELECT
            current_database() AS database_name,
            EXISTS (SELECT 1 FROM schools WHERE id = $1) AS school_exists,
            EXISTS (SELECT 1 FROM school_settings WHERE school_id = $1 AND is_active = TRUE) AS settings_exist,
            EXISTS (SELECT 1 FROM roles WHERE LOWER(role_name) IN ('admin', 'administrator')) AS admin_role_exists,
            to_regclass('public.website_pages') IS NOT NULL AS website_pages_exist,
            to_regclass('public.cbt_exams') IS NOT NULL AS cbt_schema_exists
    `, [schoolId]);

    const verification = result.rows[0];
    const failed = Object.entries(verification)
        .filter(([key, value]) => ["school_exists", "settings_exist", "admin_role_exists", "website_pages_exist", "cbt_schema_exists"].includes(key) && !value)
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

    const databaseName = registry.database_name;
    quoteIdentifier(databaseName);

    const databaseCreated = await createDatabaseIfNeeded(databaseName);
    const schoolPool = new Pool(getDatabaseConfig(databaseName));

    try {
        const client = await schoolPool.connect();
        try {
            // Build a clean school-owned schema from the repository's canonical
            // schema and then apply the school-safe migrations. No central data
            // is copied into this database.
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
            await executeDirectory(client, path.join(DATABASE_ROOT, "migrations"), {
                excluded: EXCLUDED_MIGRATIONS,
            });

            // Roles are reference data, not tenant data. Seed them after the
            // schema is complete, then ensure the application's expected
            // "admin" role is present as well.
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

            await seedSchool(client, school);

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

    // Only after the target database has been fully initialized and verified
    // is it safe for request routing to use it.
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
