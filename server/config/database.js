const { Pool } = require("pg");
const { getDatabaseConfig } = require("./databaseConfig");

const pool = new Pool(getDatabaseConfig());

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error:", error);
});

module.exports = pool;
