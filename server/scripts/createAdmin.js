require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("../config/database");

async function createAdmin() {

    try {

        const password = "admin123";

        const hashedPassword = await bcrypt.hash(password, 12);

        const roleQuery = `
            SELECT id
            FROM roles
            WHERE role_name = $1;
        `;

        const roleResult = await pool.query(
            roleQuery,
            ["Admin"]
        );

        if (roleResult.rows.length === 0) {

            console.log("Admin role not found.");

            return;
        }

        const roleId = roleResult.rows[0].id;
        
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE username = $1",
            ["admin"]
        );

        if (existingUser.rows.length > 0) {
            console.log("Administrator already exists.");
            return;
        }

        const insertQuery = `
            INSERT INTO users
            (
                role_id,
                username,
                email,
                password
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email;
        `;

        const values = [
            roleId,
            "admin",
            "admin@educore.com",
            hashedPassword
        ];

        const result = await pool.query(
            insertQuery,
            values
        );

        console.log("Administrator created successfully!");
        console.table(result.rows);

    } catch (error) {

        console.error(error.message);

    } finally {

        await pool.end();

    }

}

createAdmin();