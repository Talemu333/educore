const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");
const centralPool = require("./database");
const { getDatabaseConfig } = require("./databaseConfig");

const schoolPools = new Map();
const schoolSchemaPromises = new Map();
const DATABASE_ROOT = path.resolve(__dirname, "../database");
const MIGRATIONS_DIR = path.join(DATABASE_ROOT, "migrations");
const MIGRATION_CUTOFF = "20260912_sync_current_school_settings.sql";

const listCurrentMigrations = async () => {
    const entries = await fs.readdir(MIGRATIONS_DIR, { withFileTypes: true });
    return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".sql") && entry.name >= MIGRATION_CUTOFF)
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};

const reconcileSchoolDatabase = async (schoolId, schoolPool) => {
    const migrations = await listCurrentMigrations();
    if (!migrations.length) return;

    const client = await schoolPool.connect();
    try {
        await client.query("BEGIN");

        for (const migration of migrations) {
            const sql = await fs.readFile(path.join(MIGRATIONS_DIR, migration), "utf8");
            if (!sql.trim()) continue;
            console.log(`Reconciling school ${schoolId} with ${migration}`);
            await client.query(sql);
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw new Error(`School ${schoolId} database schema reconciliation failed: ${error.message}`);
    } finally {
        client.release();
    }
};

const ensureSchoolDatabaseSchema = async (schoolId, databaseName, schoolPool) => {
    const cacheKey = `${schoolId}:${databaseName}`;
    let schemaPromise = schoolSchemaPromises.get(cacheKey);

    if (!schemaPromise) {
        schemaPromise = reconcileSchoolDatabase(schoolId, schoolPool).catch((error) => {
            schoolSchemaPromises.delete(cacheKey);
            throw error;
        });
        schoolSchemaPromises.set(cacheKey, schemaPromise);
    }

    await schemaPromise;
};

const getSchoolDatabase = async (schoolId) => {
    const normalizedSchoolId = Number(schoolId);

    if (!Number.isInteger(normalizedSchoolId) || normalizedSchoolId < 1) {
        throw new Error("A valid school ID is required to resolve the school database.");
    }

    let result;

    try {
        result = await centralPool.query(
            `SELECT database_name, is_active
             FROM school_database_registry
             WHERE school_id = $1
             LIMIT 1`,
            [normalizedSchoolId]
        );
    } catch (error) {
        // The registry is introduced during the migration window. Until it
        // exists, keep every school on the existing central database.
        if (error.code === "42P01") {
            return centralPool;
        }
        throw error;
    }

    const config = result.rows[0];

    // A school remains on the current central database until its dedicated
    // database has been provisioned and activated in the central registry.
    if (!config || !config.is_active) {
        return centralPool;
    }

    if (config.database_name === process.env.DB_NAME) {
        return centralPool;
    }

    const cacheKey = `${normalizedSchoolId}:${config.database_name}`;
    let schoolPool = schoolPools.get(cacheKey);

    if (!schoolPool) {
        schoolPool = new Pool(getDatabaseConfig(config.database_name));

        schoolPool.on("error", (error) => {
            console.error(`Unexpected PostgreSQL pool error for school ${normalizedSchoolId}:`, error);
        });

        schoolPools.set(cacheKey, schoolPool);
    }

    // Existing isolated databases may have been provisioned before the latest
    // production schema repairs were added. Reconcile them once before any
    // school request is allowed to use the pool. This uses the current
    // migration files and never copies another school's data.
    await ensureSchoolDatabaseSchema(normalizedSchoolId, config.database_name, schoolPool);

    return schoolPool;
};

const closeSchoolDatabasePools = async () => {
    await Promise.all(
        [...schoolPools.values()].map((pool) => pool.end())
    );
    schoolPools.clear();
    schoolSchemaPromises.clear();
};

module.exports = {
    getSchoolDatabase,
    closeSchoolDatabasePools,
};
