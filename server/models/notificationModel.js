const pool = require("../config/database");

const createNotification = async (data, client = pool) => {

    const query = `

        INSERT INTO notifications (

            user_id,

            title,

            message,

            type

        )

        VALUES ($1,$2,$3,$4)

        RETURNING *;

    `;

    const values = [

        data.user_id,

        data.title,

        data.message,

        data.type

    ];

    const result = await client.query(query, values);

    return result.rows[0];

};

const getUserNotifications = async (userId) => {

    const query = `

        SELECT *

        FROM notifications

        WHERE user_id = $1

        ORDER BY created_at DESC;

    `;

    const result = await pool.query(query,[userId]);

    return result.rows;

};

const markAsRead = async (id, client = pool) => {

    const query = `

        UPDATE notifications

        SET is_read = TRUE

        WHERE id = $1

        RETURNING *;

    `;

    const result = await client.query(query,[id]);

    return result.rows[0];

};

const getNotificationById = async (id) => {

    const query = `

        SELECT *

        FROM notifications

        WHERE id = $1;

    `;

    const result = await pool.query(query,[id]);

    return result.rows[0];

};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    getNotificationById
}