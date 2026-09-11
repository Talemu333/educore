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
        `SELECT database_name, status
         FROM school_database_configs
         WHERE school_id = $1
         LIMIT 1`,
        [normalizedSchoolId]
    );

    const config = result.rows[0];

    // During the migration period, schools without a dedicated database
    // continue using the existing central database. This keeps the current
    // application working while schools are moved one at a time.
    if (!config || config.status !== "active") {
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
