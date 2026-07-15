require("dotenv").config();

const pool = require("../config/database");

async function testTransaction() {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        console.log("Transaction Started");

        await client.query(`
            INSERT INTO classes
            (class_name, class_level, sort_order)
            VALUES ('TEST CLASS', 'Junior', 99)
        `);

        throw new Error("Something went wrong!");

        await client.query("COMMIT");

    } catch (err) {

        console.log(err.message);

        await client.query("ROLLBACK");

        console.log("Transaction Rolled Back");

    } finally {

        client.release();

        process.exit();

    }

}

testTransaction();