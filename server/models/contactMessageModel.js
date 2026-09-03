const pool = require("../config/database");

const createContactMessage = async (data, schoolId) => {
    const result = await pool.query(
        `INSERT INTO contact_messages (
            school_id,
            name,
            email,
            phone,
            subject,
            message
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            id,
            school_id,
            name,
            email,
            phone,
            subject,
            message,
            status,
            created_at`,
        [
            schoolId,
            data.name,
            data.email,
            data.phone || null,
            data.subject,
            data.message,
        ]
    );

    return result.rows[0];
};

const getContactMessages = async (schoolId) => {
    const result = await pool.query(
        `SELECT
            id,
            school_id,
            name,
            email,
            phone,
            subject,
            message,
            status,
            created_at,
            updated_at
         FROM contact_messages
         WHERE school_id = $1
         ORDER BY created_at DESC, id DESC`,
        [schoolId]
    );

    return result.rows;
};

const updateContactMessageStatus = async (id, status, schoolId) => {
    const result = await pool.query(
        `UPDATE contact_messages
         SET
            status = $1,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
           AND school_id = $3
         RETURNING
            id,
            school_id,
            name,
            email,
            phone,
            subject,
            message,
            status,
            created_at,
            updated_at`,
        [status, id, schoolId]
    );

    return result.rows[0];
};

module.exports = {
    createContactMessage,
    getContactMessages,
    updateContactMessageStatus,
};
