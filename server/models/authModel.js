const pool = require("../config/database");

const findUser = async (login) => {
    const query = `
        SELECT users.id, users.username, users.email, users.password,
               users.must_change_password, users.last_login, users.admin_type,
               users.school_id, users.student_id, users.is_active, roles.role_name
        FROM users JOIN roles ON users.role_id = roles.id
        WHERE username = $1 OR email = $1;
    `;
    const result = await pool.query(query, [login]);
    return result.rows[0];
};

const findUserById = async (id) => {
    const query = `
        SELECT users.id, users.username, users.email, users.must_change_password,
               users.last_login, users.admin_type, users.school_id,
               users.student_id, users.is_active, roles.role_name
        FROM users JOIN roles ON users.role_id = roles.id
        WHERE users.id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const updateLastLogin = async (userId) => {
    await pool.query(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`, [userId]);
};

const updatePassword = async (userId, hashedPassword) => {
    const result = await pool.query(`
        UPDATE users SET password = $1, must_change_password = FALSE,
            password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 RETURNING id;
    `, [hashedPassword, userId]);
    return result.rows[0];
};

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
    updateLastLogin,
    updatePassword,
    findUserByEmail,
    savePasswordResetToken,
    findUserByResetTokenHash,
    resetPassword
};
