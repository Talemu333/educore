require("dotenv").config();

const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");
const { getDatabaseConfig } = require("../config/databaseConfig");
const centralPool = require("../config/database");

const IDENTIFIER_PATTERN = /^[A-Za-z0-9_]+$/;
const DATABASE_ROOT = path.resolve(__dirname, "../database");
const RETRYABLE_DB_ERRORS = new Set(["EAI_AGAIN", "ECONNRESET", "ETIMEDOUT", "ECONNREFUSED"]);
const DB_RETRY_ATTEMPTS = 5;
const DB_RETRY_DELAY_MS = 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withDatabaseRetry = async (operation, label = "database operation") => {
    let lastError;

    for (let attempt = 1; attempt <= DB_RETRY_ATTEMPTS; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            if (!RETRYABLE_DB_ERRORS.has(error?.code) || attempt === DB_RETRY_ATTEMPTS) {
                throw error;
            }

            console.warn(
                `${label} failed with ${error.code}. Retrying (${attempt}/${DB_RETRY_ATTEMPTS - 1})...`
            );
            await sleep(DB_RETRY_DELAY_MS * attempt);
        }
    }

    throw lastError;
};

// These migrations either create platform-wide objects, the central registry,
// copy legacy shared-database data, or are already represented by the fresh
// database schema. They must never be replayed against a fresh isolated DB.
const EXCLUDED_MIGRATIONS = new Set([
    "20260828_add_school_scope_to_academic_calendar.sql",
    "20260829_add_school_scope_to_classes_and_arms.sql",
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
        await withDatabaseRetry(() => client.query(sql), `Applying ${file}`);
    }
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
            () => maintenancePool.query(
                "SELECT 1 FROM pg_database WHERE datname = $1 LIMIT 1",
                [databaseName]
            ),
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
}
