const pool = require("../config/database");
const resolveDb = (db) => db || pool;

const createAnnouncement = async (data, schoolId, db) => {
    const result = await resolveDb(db).query(
        `INSERT INTO announcements
            (school_id, title, message, audience, created_by, is_active, publish_date, expiry_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [schoolId, data.title, data.message, data.audience, data.created_by, data.is_active, data.publish_date, data.expiry_date]
    );
    return result.rows[0];
};

const getAnnouncementsForManagement = async (schoolId, db) => {
    const result = await resolveDb(db).query(
        `SELECT a.*, u.username AS created_by_username
         FROM announcements a
         LEFT JOIN users u ON u.id = a.created_by
         WHERE a.school_id = $1
         ORDER BY a.created_at DESC, a.id DESC`,
        [schoolId]
    );
    return result.rows;
};

const getAnnouncementsForAudience = async (schoolId, audience, db) => {
    const result = await resolveDb(db).query(
        `SELECT id, title, message, audience, publish_date, expiry_date, created_at
         FROM announcements
         WHERE school_id = $1
           AND is_active = TRUE
           AND publish_date <= CURRENT_DATE
           AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
           AND audience IN ('all', $2)
         ORDER BY publish_date DESC, created_at DESC, id DESC`,
        [schoolId, audience]
    );
    return result.rows;
};

const updateAnnouncement = async (id, data, schoolId, db) => {
    const result = await resolveDb(db).query(
        `UPDATE announcements
         SET title = $1, message = $2, audience = $3, is_active = $4,
             publish_date = $5, expiry_date = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 AND school_id = $8
         RETURNING *`,
        [data.title, data.message, data.audience, data.is_active, data.publish_date, data.expiry_date, id, schoolId]
    );
    return result.rows[0];
};

const deactivateAnnouncement = async (id, schoolId, db) => {
    const result = await resolveDb(db).query(
        `UPDATE announcements SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND school_id = $2 RETURNING *`,
        [id, schoolId]
    );
    return result.rows[0];
};

module.exports = {
    createAnnouncement,
    getAnnouncementsForManagement,
    getAnnouncementsForAudience,
    updateAnnouncement,
    deactivateAnnouncement
};
