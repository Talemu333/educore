const database = require("../config/database");

// Authentication uses the active database context for school accounts.
// Platform-level password-reset-by-email flows continue to use the central DB.
const pool = database.centralPool;

const hydrateAdministratorType = async (user) => {
    if (!user) return user;

    const roleName = String(user.role_name || "").trim().toLowerCase();
    const currentType = String(user.admin_type || "").trim().toLowerCase();

    // "Admin" is the generic role. The administrator's actual type
    // (proprietor, principal, bursar, etc.) is stored in admin_type.
    // Older isolated school databases can have this value missing or set
    // to the generic "admin" value even though the central school account
    // still contains the correct administrator type.
    if (roleName !== "admin") {
        return user;
    }

    const schoolId = Number(user.school_id);
    const userId = Number(user.id);

    if (!Number.isInteger(schoolId) || schoolId < 1 || !Number.isInteger(userId) || userId < 1) {
        return user;
    }

    const centralResult = await pool.query(
        `SELECT password, admin_type, must_change_password, password_changed_at
         FROM users
         WHERE id = $1
           AND school_id = $2
         LIMIT 1`,
        [userId, schoolId]
    );

    const centralUser = centralResult.rows[0];
    const centralType = String(centralUser?.admin_type || "").trim();

    // If the isolated account still has the same password hash as the
    // central account, its password state can safely be synchronized too.
    // Once a school user changes/resets the tenant password, the hashes differ
    // and the tenant database remains authoritative for password state.
    const samePasswordHash = Boolean(
        centralUser?.password &&
        user.password &&
        centralUser.password === user.password
    );

    const shouldSyncAdminType =
        centralType &&
        centralType.toLowerCase() !== "admin" &&
        (!String(user.admin_type || "").trim() ||
         String(user.admin_type).trim().toLowerCase() === "admin");

    const shouldSyncPasswordState =
        samePasswordHash &&
        centralUser.must_change_password !== undefined &&
        (
            Boolean(user.must_change_password) !== Boolean(centralUser.must_change_password) ||
            String(user.password_changed_at || "") !== String(centralUser.password_changed_at || "")
        );

    if (!shouldSyncAdminType && !shouldSyncPasswordState) {
        return user;
    }

    try {
        await database.query(
            `UPDATE users
             SET admin_type = CASE
                     WHEN $1::text IS NULL THEN admin_type
                     ELSE $1
                 END,
                 must_change_password = CASE
                     WHEN $2::boolean IS NULL THEN must_change_password
                     ELSE $2
                 END,
                 password_changed_at = CASE
                     WHEN $3::timestamp IS NULL THEN password_changed_at
                     ELSE $3
                 END,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4
               AND school_id = $5`,
            [
                shouldSyncAdminType ? centralType : null,
                shouldSyncPasswordState ? Boolean(centralUser.must_change_password) : null,
                shouldSyncPasswordState ? centralUser.password_changed_at : null,
                userId,
                schoolId
            ]
        );
    } catch (error) {
        console.error("Failed to synchronize school account state:", error);
    }

    return {
        ...user,
        ...(shouldSyncAdminType ? { admin_type: centralType } : {}),
        ...(shouldSyncPasswordState
            ? {
                must_change_password: Boolean(centralUser.must_change_password),
                password_changed_at: centralUser.password_changed_at
            }
            : {})
    };
};

const findUser = async (login) => {
    const result = await database.query(`
        SELECT users.id, users.username, users.email, users.password,
               users.must_change_password, users.last_login, users.admin_type,
               users.school_id, users.student_id, users.is_active, roles.role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.username = $1 OR users.email = $1;
    `, [login]);

    return hydrateAdministratorType(result.rows[0]);
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

    return hydrateAdministratorType(result.rows[0]);
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
