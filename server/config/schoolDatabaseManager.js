const { Pool } = require("pg");
const centralPool = require("./database");
const { getDatabaseConfig } = require("./databaseConfig");

const schoolPools = new Map();

const getSchoolDatabase = async (schoolId) => {
    const normalizedSchoolId = Number(schoolId);

    if (!Number.isInteger(normalizedSchoolId) || normalizedSchoolId < 1) {
        throw new Error("A valid school ID is required to resolve the school database.");
    }

    const result = await centralPool.query(
        `SELECT database_name, is_active
         FROM school_database_registry
         WHERE school_id = $1
         LIMIT 1`,
        [normalizedSchoolId]
    );

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
    const existingPool = schoolPools.get(cacheKey);

    if (existingPool) {
        return existingPool;
    }

    const schoolPool = new Pool(getDatabaseConfig(config.database_name));

    schoolPool.on("error", (error) => {
        console.error(`Unexpected PostgreSQL pool error for school ${normalizedSchoolId}:`, error);
    });

    schoolPools.set(cacheKey, schoolPool);
    return schoolPool;
};

const closeSchoolDatabasePools = async () => {
    await Promise.all(
        [...schoolPools.values()].map((pool) => pool.end())
    );
    schoolPools.clear();
};

module.exports = {
    getSchoolDatabase,
    closeSchoolDatabasePools,
};
