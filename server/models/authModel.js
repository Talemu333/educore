const pool = require("../config/database");

const findUser = async (login) => {

    const query = `

        SELECT

            users.id,

            users.username,

            users.email,

            users.password,

            roles.role_name

        FROM users

        JOIN roles

            ON users.role_id = roles.id

        WHERE

            username = $1

            OR email = $1;

    `;

    const result = await pool.query(

        query,

        [login]

    );

    return result.rows[0];

};

const findUserById = async (id) => {

    const query = `
        SELECT
            users.id,
            users.username,
            users.email,
            roles.role_name

        FROM users

        JOIN roles
            ON users.role_id = roles.id

        WHERE users.id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];

};

module.exports = {
    findUser,
    findUserById
};