const pool = require("../config/database");

const createNotification = async (data, client = pool) => {
    const query = `
        INSERT INTO notifications (
            user_id,
            school_id,
            title,
            message,
            type
        )
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *;
    `;

    const values = [
        data.user_id,
        data.school_id,
        data.title,
        data.message,
        data.type
    ];

    const result = await client.query(query, values);
    return result.rows[0];
};

const getUserNotifications = async (userId, schoolId) => {
    const query = `
        SELECT *
        FROM notifications
        WHERE user_id = $1
          AND school_id = $2
        ORDER BY created_at DESC;
    `;

    const result = await pool.query(query, [userId, schoolId]);
    return result.rows;
};

const markAsRead = async (id, schoolId, client = pool) => {
    const query = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1
          AND school_id = $2
        RETURNING *;
    `;

    const result = await client.query(query, [id, schoolId]);
    return result.rows[0];
};

const getNotificationById = async (id, schoolId) => {
    const query = `
        SELECT *
        FROM notifications
        WHERE id = $1
          AND school_id = $2;
    `;

    const result = await pool.query(query, [id, schoolId]);
    return result.rows[0];
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    getNotificationById
};
