const pool = require("../config/database");

const createUser = async (client, userData) => {

    const query = `
        INSERT INTO users
        (
            username,
            password,
            role_id,
            must_change_password
        )
        VALUES
        (
            $1,$2,$3,$4
        )
        RETURNING *;
    `;

    const result = await client.query(query, [

        userData.username,

        userData.password,

        userData.role_id,

        true

    ]);

    return result.rows[0];

};

const getUserByUsername = async (username) => {

    const query = `
        SELECT *
        FROM users
        WHERE username = $1;
    `;

    const result = await pool.query(query, [username]);

    return result.rows[0];

};

module.exports = {
    createUser,
    getUserByUsername
}