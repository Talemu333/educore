const database = require("../config/database");
const { getSchoolDatabase } = require("../config/schoolDatabaseManager");

// Authentication uses the active database context for school accounts.
// Platform-level password-reset-by-email flows continue to use the central DB.
const pool = database.centralPool;

const normalizeRoleName = (roleName) => {
    const normalized = String(roleName || "").trim().toLowerCase();

    if (normalized === "administrator") return "Admin";
    if (normalized === "admin") return "Admin";

    return String(roleName || "").trim();
};

const hydrateAdministratorType = async (user) => {
    if (!user) return user;

    const roleName = String(user.role_name || "").trim().toLowerCase();

    // "Admin" is the canonical application role. Older school databases may
    // still contain the legacy "Administrator" role name. Treat both as the
    // same role so an isolated school's administrator is not denied access.
    if (!["admin", "administrator"].includes(roleName)) {
        return {
            ...user,
            role_name: normalizeRoleName(user.role_name)
        };
    }

    const schoolId = Number(user.school_id);
    const userId = Number(user.id);

    if (!Number.isInteger(schoolId) || schoolId < 1 || !Number.isInteger(userId) || userId < 1) {
        return {
            ...user,
            role_name: "Admin"
        };
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
        return {
            ...user,
            role_name: "Admin"
        };
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
        role_name: "Admin",
        ...(shouldSyncAdminType ? { admin_type: centralType } : {}),
        ...(shouldSyncPasswordState
            ? {
                must_change_password: Boolean(centralUser.must_change_password),
                password_changed_at: centralUser.password_changed_at
            }
            : {})
    };
};

const updatePasswordCopies = async (userId, schoolId, hashedPassword, mustChangePassword) => {
    const normalizedSchoolId = Number(schoolId);
    if (!Number.isInteger(normalizedSchoolId) || normalizedSchoolId < 1) {
        throw new Error("A valid school ID is required to update this password.");
    }

    const schoolPool = await getSchoolDatabase(normalizedSchoolId);
    const updateSql = `
        UPDATE users
        SET password = $1,
            must_change_password = $2,
            password_changed_at = CASE WHEN $2 THEN NULL ELSE CURRENT_TIMESTAMP END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND school_id = $4 AND is_active = TRUE
        RETURNING id
    `;

    if (schoolPool === pool) {
        const result = await pool.query(updateSql, [hashedPassword, mustChangePassword, userId, normalizedSchoolId]);
        return result.rows[0];
    }

    const previousResult = await schoolPool.query(
        `SELECT password, must_change_password, password_changed_at
         FROM users WHERE id = $1 AND school_id = $2 LIMIT 1`,
        [userId, normalizedSchoolId]
    );
    if (!previousResult.rows[0]) return null;

    const tenantResult = await schoolPool.query(
        updateSql,
        [hashedPassword, mustChangePassword, userId, normalizedSchoolId]
    );
    if (!tenantResult.rows[0]) return null;

    try {
        const centralResult = await pool.query(
            updateSql,
            [hashedPassword, mustChangePassword, userId, normalizedSchoolId]
        );
        if (!centralResult.rows[0]) {
            throw new Error("The matching platform account could not be updated.");
        }
        return centralResult.rows[0];
    } catch (error) {
        const previous = previousResult.rows[0];
        await schoolPool.query(
            `UPDATE users
             SET password = $1,
                 must_change_password = $2,
                 password_changed_at = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 AND school_id = $5`,
            [previous.password, previous.must_change_password, previous.password_changed_at, userId, normalizedSchoolId]
        ).catch((rollbackError) => {
            console.error("Failed to restore tenant password after platform sync error:", rollbackError);
        });
        throw error;
    }
};

const findUser = async (login) => {
    const result = await database.query(`
        SELECT users.id, users.username, users.email, users.password, COALESCE(users.profile_image_url, students.profile_image_url, teachers.profile_image_url, parents.profile_image_url) AS profile_image_url,
               students.id AS student_id, users.must_change_password, users.last_login, users.admin_type,
               users.school_id, users.is_active, roles.role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        LEFT JOIN students ON students.id = users.student_id
            AND students.school_id = users.school_id
        LEFT JOIN teachers ON teachers.user_id = users.id AND teachers.school_id = users.school_id
        LEFT JOIN parents ON parents.user_id = users.id AND parents.school_id = users.school_id
        WHERE users.username = $1 OR users.email = $1;
    `, [login]);

    return hydrateAdministratorType(result.rows[0]);
};

const findUserById = async (id) => {
    const result = await database.query(`
        SELECT users.id, users.username, users.email, COALESCE(users.profile_image_url, students.profile_image_url, teachers.profile_image_url, parents.profile_image_url) AS profile_image_url, students.id AS student_id, users.must_change_password,
               users.last_login, users.admin_type, users.school_id,
               users.is_active, roles.role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        LEFT JOIN students ON students.id = users.student_id
            AND students.school_id = users.school_id
        LEFT JOIN teachers ON teachers.user_id = users.id AND teachers.school_id = users.school_id
        LEFT JOIN parents ON parents.user_id = users.id AND parents.school_id = users.school_id
        WHERE users.id = $1;
    `, [id]);

    return hydrateAdministratorType(result.rows[0]);
};

const findUserByIdInSchool = async (id, schoolId) => {
    const result = await database.query(`
        SELECT users.id, users.username, users.email, COALESCE(users.profile_image_url, students.profile_image_url, teachers.profile_image_url, parents.profile_image_url) AS profile_image_url, students.id AS student_id, users.must_change_password,
               users.last_login, users.admin_type, users.school_id, users.is_active, roles.role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        LEFT JOIN students ON students.id = users.student_id
            AND students.school_id = users.school_id
        LEFT JOIN teachers ON teachers.user_id = users.id AND teachers.school_id = users.school_id
        LEFT JOIN parents ON parents.user_id = users.id AND parents.school_id = users.school_id
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

const updatePassword = async (userId, hashedPassword, schoolId = null) => {
    if (schoolId) {
        return updatePasswordCopies(userId, schoolId, hashedPassword, false);
    }
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


const updateUsername = async (userId, schoolId, username) => {
    const normalizedUsername = String(username || "").trim();

    // Usernames must be unique in both the tenant database and platform
    // registry because school authentication is mirrored across both.
    const existing = await database.query(
        `SELECT username FROM users WHERE id = $1 AND school_id = $2 LIMIT 1`,
        [userId, schoolId]
    );
    if (!existing.rows[0]) return null;
    const previousUsername = existing.rows[0].username;

    const tenantConflict = await database.query(
        `SELECT id FROM users
         WHERE LOWER(username) = LOWER($1) AND id <> $2
         LIMIT 1`,
        [normalizedUsername, userId]
    );
    if (tenantConflict.rows.length) {
        const error = new Error("That username is already in use. Please choose another.");
        error.code = "USERNAME_CONFLICT";
        throw error;
    }

    const centralConflict = await pool.query(
        `SELECT id FROM users
         WHERE LOWER(username) = LOWER($1)
           AND NOT (id = $2 AND school_id = $3)
         LIMIT 1`,
        [normalizedUsername, userId, schoolId]
    );
    if (centralConflict.rows.length) {
        const error = new Error("That username is already in use. Please choose another.");
        error.code = "USERNAME_CONFLICT";
        throw error;
    }

    const tenantUpdate = await database.query(
        `UPDATE users SET username = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND school_id = $3
         RETURNING id, username, email, school_id`,
        [normalizedUsername, userId, schoolId]
    );
    if (!tenantUpdate.rows[0]) return null;

    try {
        const centralUpdate = await pool.query(
            `UPDATE users SET username = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND school_id = $3
             RETURNING id`,
            [normalizedUsername, userId, schoolId]
        );
        if (!centralUpdate.rows[0]) {
            throw new Error("The platform account could not be synchronised.");
        }
    } catch (error) {
        // Restore the tenant value if the registry update fails.
        await database.query(
            `UPDATE users SET username = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND school_id = $3`,
            [previousUsername, userId, schoolId]
        ).catch(() => {});
        throw error;
    }

    return tenantUpdate.rows[0];
};

const updateProfileImageUrl = async (userId, profileImageUrl) => {
    const result = await database.query(`
        UPDATE users
        SET profile_image_url = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, profile_image_url;
    `, [profileImageUrl, userId]);
    return result.rows[0];
};

const resetPasswordByAdmin = async (userId, schoolId, hashedPassword) => {
    const updated = await updatePasswordCopies(userId, schoolId, hashedPassword, true);
    if (!updated) return null;
    return findUserByIdInSchool(userId, schoolId);
};

// Email reset flows are platform-level and therefore remain on the central DB.
const findUserByEmail = async (email) => {
    const result = await pool.query(`
        SELECT id, username, email, school_id, is_active
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
        SELECT id, username, email, school_id, is_active
        FROM users
        WHERE password_reset_token_hash = $1
          AND password_reset_expires_at > CURRENT_TIMESTAMP
        LIMIT 1;
    `, [tokenHash]);
    return result.rows[0];
};

// A reset token is stored centrally, but school accounts may authenticate
// against a dedicated tenant database. Update both copies so the same
// credentials work on the school's custom domain and the platform domain.
const resetPassword = async (userId, schoolId, hashedPassword, tokenHash) => {
    const normalizedSchoolId = Number(schoolId);
    if (!Number.isInteger(normalizedSchoolId) || normalizedSchoolId < 1) {
        throw new Error("A valid school ID is required to reset this account.");
    }

    const schoolPool = await getSchoolDatabase(normalizedSchoolId);
    const centralClient = await pool.connect();
    const tenantClient = schoolPool === pool ? null : await schoolPool.connect();

    let centralTransaction = false;
    let tenantTransaction = false;

    try {
        await centralClient.query("BEGIN");
        centralTransaction = true;

        const tokenResult = await centralClient.query(
            `SELECT id, school_id
             FROM users
             WHERE id = $1
               AND school_id = $2
               AND password_reset_token_hash = $3
               AND password_reset_expires_at > CURRENT_TIMESTAMP
               AND is_active = TRUE
             FOR UPDATE`,
            [userId, normalizedSchoolId, tokenHash]
        );

        if (!tokenResult.rows[0]) {
            await centralClient.query("ROLLBACK");
            centralTransaction = false;
            return null;
        }

        if (tenantClient) {
            await tenantClient.query("BEGIN");
            tenantTransaction = true;

            const tenantResult = await tenantClient.query(
                `UPDATE users
                 SET password = $1,
                     must_change_password = FALSE,
                     password_changed_at = CURRENT_TIMESTAMP,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2
                   AND school_id = $3
                   AND is_active = TRUE
                 RETURNING id`,
                [hashedPassword, userId, normalizedSchoolId]
            );

            if (!tenantResult.rows[0]) {
                throw new Error("The school account could not be found in its dedicated database. The password was not reset.");
            }
        }

        const centralResult = await centralClient.query(
            `UPDATE users
             SET password = $1,
                 must_change_password = FALSE,
                 password_changed_at = CURRENT_TIMESTAMP,
                 password_reset_token_hash = NULL,
                 password_reset_expires_at = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
               AND school_id = $3
               AND password_reset_token_hash = $4
             RETURNING id`,
            [hashedPassword, userId, normalizedSchoolId, tokenHash]
        );

        if (!centralResult.rows[0]) {
            throw new Error("The password reset could not be completed. Please request a new reset link.");
        }

        // Commit the tenant copy first while the central token row remains
        // locked. If either operation fails, the still-open transaction can
        // be rolled back rather than reporting a partially completed reset.
        if (tenantClient) {
            await tenantClient.query("COMMIT");
            tenantTransaction = false;
        }

        await centralClient.query("COMMIT");
        centralTransaction = false;

        return centralResult.rows[0];
    } catch (error) {
        if (tenantTransaction) await tenantClient.query("ROLLBACK").catch(() => {});
        if (centralTransaction) await centralClient.query("ROLLBACK").catch(() => {});
        throw error;
    } finally {
        tenantClient?.release();
        centralClient.release();
    }
};

module.exports = {
    findUser,
    findUserById,
    findUserByIdInSchool,
    updateLastLogin,
    updatePassword,
    updateUsername,
    updateProfileImageUrl,
    resetPasswordByAdmin,
    findUserByEmail,
    savePasswordResetToken,
    findUserByResetTokenHash,
    resetPassword
};