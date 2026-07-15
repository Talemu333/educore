const pool = require("./config/database");

async function testDatabase() {
    try {
        const result = await pool.query("SELECT NOW()");

        console.log("=================================");
        console.log("✅ PostgreSQL Connected Successfully");
        console.log("=================================");

        console.log(result.rows[0]);
    } catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error.message);
    } finally {
        await pool.end();
    }
}

testDatabase();