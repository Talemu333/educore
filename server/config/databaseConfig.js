const path = require("node:path");
const dotenv = require("dotenv");

// Load the server-local .env when scripts are launched from the repository root.
// Existing process environment variables (for example on Render) remain
// authoritative because dotenv does not override them by default.
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const getDatabaseConfig = (databaseOverride = null) => ({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: databaseOverride || process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.DB_HOST?.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : false,
});

module.exports = { getDatabaseConfig };
