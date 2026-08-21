const pool = require("../config/database");


/*
=========================================
CREATE USER
=========================================
*/

/*
=========================================
CREATE USER
=========================================
*/

const createUser = async (client, userData) => {

    const query = `
        INSERT INTO users
        (
            username,
            email,
            password,
            role_id,
            must_change_password,
            is_active
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            TRUE,
            TRUE
        )
        RETURNING
            id,
            username,
            email,
            role_id,
            is_active,
            must_change_password,
            created_at,
            updated_at;
    `;

    const result =
        await client.query(
            query,
            [
                userData.username,
                userData.email || null,
                userData.password,
                userData.role_id
            ]
        );

    return result.rows[0];

};


/*
=========================================
GET USER BY USERNAME
=========================================
*/

const getUserByUsername = async (username) => {

    const query = `
        SELECT *
        FROM users
        WHERE username = $1;
    `;

    const result =
        await pool.query(query, [username]);

    return result.rows[0];

};


/*
=========================================
GET USER BY ID
=========================================
*/

const getUserById = async (id) => {

    const query = `
        SELECT
            id,
            username,
            email,
            password,
            role_id,
            admin_type,
            must_change_password,
            is_active
        FROM users
        WHERE id = $1;
    `;

    const result =
        await pool.query(query, [id]);

    return result.rows[0];

};


/*
=========================================
CHANGE PASSWORD
=========================================
*/

const changePassword = async (
    userId,
    hashedPassword
) => {

    const query = `

        UPDATE users

        SET
            password = $1,
            password_changed_at = CURRENT_TIMESTAMP,
            must_change_password = FALSE,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $2

        RETURNING
            id,
            username,
            email;

    `;

    const result =
        await pool.query(
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
GET PARENTS
=========================================
*/

const getParents = async () => {

    const query = `
        SELECT
            p.id,
            p.user_id,
            p.surname,
            p.first_name,
            p.middle_name,
            p.phone_number,
            p.email,
            p.gender
        FROM parents p
        ORDER BY
            p.surname,
            p.first_name;
    `;

    const result =
        await pool.query(query);

    return result.rows;

};


/*
=========================================
GET ADMINISTRATORS
=========================================
*/

const getAdmins = async () => {

    const query = `

        SELECT
            u.id,
            u.username,
            u.email,
            u.role_id,
            r.role_name,
            u.admin_type,
            u.is_active,
            u.created_at,
            u.updated_at

        FROM users u

        INNER JOIN roles r
            ON r.id = u.role_id

        WHERE
            LOWER(r.role_name) = 'admin'

        ORDER BY
            CASE
                WHEN LOWER(u.admin_type) = 'proprietor'
                    THEN 1

                WHEN LOWER(u.admin_type) = 'principal'
                    THEN 2

                WHEN LOWER(u.admin_type) = 'vice_principal'
                    THEN 3

                WHEN LOWER(u.admin_type) = 'bursar'
                    THEN 4

                WHEN LOWER(u.admin_type) = 'librarian'
                    THEN 5

                ELSE 6
            END,

            u.username;

    `;


    const result =
        await pool.query(query);


    return result.rows;

};


/*
=========================================
DEACTIVATE ADMINISTRATOR
=========================================
*/

const deactivateAdmin = async (userId) => {

    const query = `

        UPDATE users u

        SET
            is_active = FALSE,
            updated_at = CURRENT_TIMESTAMP

        FROM roles r

        WHERE
            u.id = $1

            AND u.role_id = r.id

            AND LOWER(r.role_name) = 'admin'

            /*
            =========================================
            DO NOT ALLOW PROPRIETOR TO BE DEACTIVATED
            =========================================
            */

            AND LOWER(COALESCE(u.admin_type, '')) <> 'proprietor'

        RETURNING
            u.id,
            u.username,
            u.email,
            u.role_id,
            r.role_name,
            u.admin_type,
            u.is_active,
            u.updated_at;

    `;


    const result =
        await pool.query(
            query,
            [userId]
        );


    return result.rows[0];

};


/*
=========================================
ACTIVATE ADMINISTRATOR
=========================================
*/

const activateAdmin = async (userId) => {

    const query = `

        UPDATE users u

        SET
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP

        FROM roles r

        WHERE
            u.id = $1

            AND u.role_id = r.id

            AND LOWER(r.role_name) = 'admin'

        RETURNING
            u.id,
            u.username,
            u.email,
            u.role_id,
            r.role_name,
            u.admin_type,
            u.is_active,
            u.updated_at;

    `;


    const result =
        await pool.query(
            query,
            [userId]
        );


    return result.rows[0];

};


/*
=========================================
CREATE ADMINISTRATOR
=========================================
*/

const createAdministrator = async (userData) => {

    const query = `

        INSERT INTO users
        (
            username,
            email,
            password,
            role_id,
            admin_type,
            must_change_password,
            is_active
        )

        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            TRUE,
            TRUE
        )

        RETURNING
            id,
            username,
            email,
            role_id,
            admin_type,
            is_active,
            must_change_password,
            created_at,
            updated_at;

    `;


    const result =
        await pool.query(

            query,

            [
                userData.username,
                userData.email || null,
                userData.password,
                userData.role_id,
                userData.admin_type
            ]

        );


    return result.rows[0];

};


/*
=========================================
DELETE USER
=========================================
*/

const deleteUser = async (
    client,
    userId
) => {

    const query = `
        DELETE FROM users
        WHERE id = $1;
    `;

    await client.query(
        query,
        [userId]
    );

};


/*
=========================================
EXPORT
=========================================
*/

module.exports = {

    createUser,

    getUserByUsername,

    getUserById,

    changePassword,

    getParents,

    getAdmins,

    deactivateAdmin,

    activateAdmin,

    deleteUser,
    createAdministrator

};