const pool = require("../config/database");

const createUser = async (client, userData, schoolId) => {
    const result = await client.query(`
        INSERT INTO users (username, email, password, role_id, school_id, must_change_password, is_active)
        VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)
        RETURNING id, username, email, role_id, school_id, is_active, must_change_password, created_at, updated_at;
    `, [userData.username, userData.email || null, userData.password, userData.role_id, schoolId]);
    return result.rows[0];
};

const getUserByUsername = async (username, schoolId = null) => {
    const params = schoolId ? [username, schoolId] : [username];
    const result = await pool.query(`SELECT * FROM users WHERE username = $1 ${schoolId ? "AND school_id = $2" : ""};`, params);
    return result.rows[0];
};

const getUserById = async (id, schoolId = null) => {
    const params = schoolId ? [id, schoolId] : [id];
    const result = await pool.query(`
        SELECT id, username, email, password, role_id, school_id, admin_type, must_change_password, is_active
        FROM users WHERE id = $1 ${schoolId ? "AND school_id = $2" : ""};
    `, params);
    return result.rows[0];
};

const changePassword = async (userId, hashedPassword, schoolId = null) => {
    const params = schoolId ? [hashedPassword, userId, schoolId] : [hashedPassword, userId];
    const result = await pool.query(`
        UPDATE users SET password = $1, password_changed_at = CURRENT_TIMESTAMP,
        must_change_password = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 ${schoolId ? "AND school_id = $3" : ""}
        RETURNING id, username, email, school_id;
    `, params);
    return result.rows[0];
};

const getParents = async (schoolId) => {
    const result = await pool.query(`
        SELECT p.id, p.user_id, p.surname, p.first_name, p.middle_name, p.phone_number, p.email, p.gender
        FROM parents p INNER JOIN users u ON u.id = p.user_id
        WHERE u.school_id = $1 ORDER BY p.surname, p.first_name;
    `, [schoolId]);
    return result.rows;
};

const getAdmins = async (schoolId) => {
    const result = await pool.query(`
        SELECT u.id, u.username, u.email, u.role_id, r.role_name, u.admin_type,
               u.is_active, u.created_at, u.updated_at
        FROM users u INNER JOIN roles r ON r.id = u.role_id
        WHERE LOWER(r.role_name) = 'admin' AND u.school_id = $1
        ORDER BY CASE
            WHEN LOWER(u.admin_type) = 'proprietor' THEN 1
            WHEN LOWER(u.admin_type) = 'principal' THEN 2
            WHEN LOWER(u.admin_type) = 'vice_principal' THEN 3
            WHEN LOWER(u.admin_type) = 'bursar' THEN 4
            WHEN LOWER(u.admin_type) = 'librarian' THEN 5 ELSE 6 END, u.username;
    `, [schoolId]);
    return result.rows;
};

const deactivateAdmin = async (userId, schoolId) => {
    const result = await pool.query(`
        UPDATE users u SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        FROM roles r WHERE u.id = $1 AND u.school_id = $2 AND u.role_id = r.id
        AND LOWER(r.role_name) = 'admin'
        AND LOWER(COALESCE(u.admin_type, '')) <> 'proprietor'
        RETURNING u.id, u.username, u.email, u.role_id, r.role_name, u.admin_type, u.is_active, u.updated_at;
    `, [userId, schoolId]);
    return result.rows[0];
};

const activateAdmin = async (userId, schoolId) => {
    const result = await pool.query(`
        UPDATE users u SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP
        FROM roles r WHERE u.id = $1 AND u.school_id = $2 AND u.role_id = r.id
        AND LOWER(r.role_name) = 'admin'
        RETURNING u.id, u.username, u.email, u.role_id, r.role_name, u.admin_type, u.is_active, u.updated_at;
    `, [userId, schoolId]);
    return result.rows[0];
};

const createAdministrator = async (userData, schoolId) => {
    const result = await pool.query(`
        INSERT INTO users (username, email, password, role_id, school_id, admin_type, must_change_password, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE)
        RETURNING id, username, email, role_id, school_id, admin_type, is_active, must_change_password, created_at, updated_at;
    `, [userData.username, userData.email || null, userData.password, userData.role_id, schoolId, userData.admin_type]);
    return result.rows[0];
};

const deleteUser = async (client, userId, schoolId) => {
    await client.query(`DELETE FROM users WHERE id = $1 AND school_id = $2`, [userId, schoolId]);
};

module.exports = { createUser, getUserByUsername, getUserById, changePassword, getParents, getAdmins, deactivateAdmin, activateAdmin, deleteUser, createAdministrator };