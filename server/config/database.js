const { Pool } = require("pg");
const { getDatabaseConfig } = require("./databaseConfig");
const { getSchoolDatabaseFromContext } = require("./databaseContext");

// This pool is the central/platform database pool.
const centralPool = new Pool(getDatabaseConfig());

centralPool.on("error", (error) => {
    console.error("Unexpected central PostgreSQL pool error:", error);
});

const activePool = () => getSchoolDatabaseFromContext() || centralPool;

// Existing models can continue using this module. During a school request,
// their queries are transparently routed to that school's database.
const database = {
    query: (...args) => activePool().query(...args),
    connect: (...args) => activePool().connect(...args),
    end: (...args) => activePool().end(...args),
    on: (...args) => activePool().on(...args),
};

database.centralPool = centralPool;

module.exports = database;
