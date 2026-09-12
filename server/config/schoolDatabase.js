const { Pool } = require("pg");
const { getDatabaseConfig } = require("./databaseConfig");

const pools = new Map();

const normalizeDatabaseName = (databaseName) => {
    const value = String(databaseName || "").trim();
    if (!/^[A-Za-z0-9_]+$/.test(value)) {
        throw new Error("Invalid school database name.");
    }
    return value;
};

const getSchoolDatabase = (databaseName) => {
    const name = normalizeDatabaseName(databaseName);

    if (pools.has(name)) {
        return pools.get(name);
    }

    const pool = new Pool(getDatabaseConfig(name));

    pool.on("error", (error) => {
        console.error(`Unexpected PostgreSQL pool error for ${name}:`, error);
    });

    pools.set(name, pool);
    return pool;
};

const closeSchoolDatabase = async (databaseName) => {
    const name = normalizeDatabaseName(databaseName);
    const pool = pools.get(name);

    if (!pool) return;

    pools.delete(name);
    await pool.end();
};

const closeAllSchoolDatabases = async () => {
    const activePools = [...pools.entries()];
    pools.clear();
    await Promise.all(activePools.map(([, pool]) => pool.end()));
};

module.exports = {
    getSchoolDatabase,
    closeSchoolDatabase,
    closeAllSchoolDatabases,
};
