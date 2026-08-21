const pool = require("../config/database");


/*
=========================================
FIND USER FOR LOGIN
=========================================
*/

const findUser = async (login) => {

    const query = `

        SELECT

            users.id,

            users.username,

            users.email,

            users.password,

            users.must_change_password,

            users.last_login,

            users.admin_type,

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


/*
=========================================
FIND USER BY ID
=========================================
*/

const findUserById = async (id) => {

    const query = `

        SELECT

            users.id,

            users.username,

            users.email,

            users.must_change_password,

            users.last_login,

            users.admin_type,

            roles.role_name

        FROM users

        JOIN roles

            ON users.role_id = roles.id

        WHERE users.id = $1;

    `;

    const result =
        await pool.query(query, [id]);

    return result.rows[0];

};


/*
=========================================
UPDATE LAST LOGIN
=========================================
*/

const updateLastLogin = async (userId) => {

    const query = `

        UPDATE users

        SET

            last_login = CURRENT_TIMESTAMP

        WHERE id = $1;

    `;


    await pool.query(
        query,
        [userId]
    );

};


/*
=========================================
UPDATE PASSWORD
=========================================
*/

const updatePassword = async (
    userId,
    hashedPassword
) => {

    const query = `

        UPDATE users

        SET

            password = $1,

            must_change_password = FALSE,

            password_changed_at =
                CURRENT_TIMESTAMP,

            updated_at =
                CURRENT_TIMESTAMP

        WHERE id = $2

        RETURNING id;

    `;


    const result = await pool.query(

        query,

        [
            hashedPassword,
            userId
        ]

    );


    return result.rows[0];

};


/*
=========================================
EXPORT
=========================================
*/

module.exports = {

    findUser,

    findUserById,

    updateLastLogin,

    updatePassword

};