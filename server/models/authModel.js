const database = require("../config/database");

// Authentication uses the active database context for school accounts.
// Platform-level password-reset-by-email flows continue to use the central DB.
const pool = database.centralPool;

const findUser = async (login) => {
    const result = await database.query(`
        SELECT users.id, users.username, users.email, users.password,
               users.must_change_password, users.last_login, users.admin_type,
               users.school_id, users.student_id, users.is_active, roles.role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.username = $1 OR users.email = $1;
    `, [login]);
    return result.rows[0];
};

const findUserById = async (id) => {
    const result = await database.query(`
        SELECT users.id, users.username, users.email, users.must_change_password,
               users.last_login, users.admin_type, users.school_id,
               users.student_id, users.is_active, roles.role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.id = $1;
    `, [id]);
    return result.rows[0];
};

const findUserByIdInSchool = async (id, schoolId) => {
    const result = await database.query(`
        SELECT users.id, users.username, users.email, users.must_change_password,
               users.last_login, users.admin_type, users.school_id,
               users.student_id, users.is_active, roles.role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.id = $1 AND users.school_id = $2;
    `, [id, schoolId]);
    return result.rows[0];
};

const updateLastLogin = async (userId) => {
    await database.query(
        `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
        [userId]
    );
};

const updatePassword = async (userId, hashedPassword) => {
    const result = await database.query(`
        UPDATE users
        SET password = $1,
            must_change_password = FALSE,
            password_changed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id;
    `, [hashedPassword, userId]);
    return result.rows[0];
};

const resetPasswordByAdmin = async (userId, schoolId, hashedPassword) => {
    const result = await database.query(`
        UPDATE users
        SET password = $1,
            must_change_password = TRUE,
            password_changed_at = NULL,
            password_reset_token_hash = NULL,
            password_reset_expires_at = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
          AND school_id = $3
          AND is_active = TRUE
        RETURNING id, username, email, school_id, role_id, admin_type, must_change_password;
    `, [hashedPassword, userId, schoolId]);
    return result.rows[0];
};

// Email reset flows are platform-level and therefore remain on the central DB.
const findUserByEmail = async (email) => {
    const result = await pool.query(`
        SELECT id, username, email, school_id, student_id, is_active
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1;
    `, [email]);
    return result.rows[0];
};

const savePasswordResetToken = async (userId, tokenHash, expiresAt) => {
    await pool.query(`
        UPDATE users
        SET password_reset_token_hash = $1,
            password_reset_expires_at = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3;
    `, [tokenHash, expiresAt, userId]);
};

const findUserByResetTokenHash = async (tokenHash) => {
    const result = await pool.query(`
        SELECT id, username, email, school_id, student_id, is_active
        FROM users
        WHERE password_reset_token_hash = $1
          AND password_reset_expires_at > CURRENT_TIMESTAMP
        LIMIT 1;
    `, [tokenHash]);
    return result.rows[0];
};

const resetPassword = async (userId, hashedPassword) => {
    const result = await pool.query(`
        UPDATE users
        SET password = $1,
            must_change_password = FALSE,
            password_changed_at = CURRENT_TIMESTAMP,
            password_reset_token_hash = NULL,
            password_reset_expires_at = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id;
    `, [hashedPassword, userId]);
    return result.rows[0];
};

module.exports = {
    findUser,
    findUserById,
    findUserByIdInSchool,
    updateLastLogin,
    updatePassword,
    resetPasswordByAdmin,
    findUserByEmail,
    savePasswordResetToken,
    findUserByResetTokenHash,
    resetPassword
};
