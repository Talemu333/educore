const pool = require("../config/database");

const resolveDb = (db) => db || pool;

const createAnnouncement = async (data, schoolId, db) => {
    const result = await resolveDb(db).query(
        `INSERT INTO announcements (
            school_id,
            title,
            message,
            audience,
            created_by,
            expiry_date
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
            schoolId,
            data.title,
            data.message,
            data.audience,
            data.created_by,
            data.expiry_date
        ]
    );

    return result.rows[0];
};

const getAnnouncements = async (schoolId, db) => {
    const result = await resolveDb(db).query(
        `SELECT *
         FROM announcements
         WHERE is_active = TRUE
           AND school_id = $1
         ORDER BY created_at DESC`,
        [schoolId]
    );

    return result.rows;
};

const updateAnnouncement = async (id, data, schoolId, db) => {
    const result = await resolveDb(db).query(
        `UPDATE announcements
         SET
            title = $1,
            message = $2,
            audience = $3,
            expiry_date = $4,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
           AND school_id = $6
         RETURNING *`,
        [
            data.title,
            data.message,
            data.audience,
            data.expiry_date,
            id,
            schoolId
        ]
    );

    return result.rows[0];
};

const deactivateAnnouncement = async (id, schoolId, db) => {
    const result = await resolveDb(db).query(
        `UPDATE announcements
         SET
            is_active = FALSE,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
           AND school_id = $2
         RETURNING *`,
        [id, schoolId]
    );

    return result.rows[0];
};

module.exports = {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deactivateAnnouncement
};
