const pool = require("../config/database");
const resolveDb = (db) => db || pool;

const validateTarget = async (data, schoolId, db) => {
    if (data.audience !== "class") return;
    const classResult = await resolveDb(db).query(
        "SELECT id FROM classes WHERE id = $1 AND school_id = $2 LIMIT 1",
        [data.target_class_id, schoolId]
    );
    if (!classResult.rows.length) {
        const error = new Error("The selected class does not belong to this school.");
        error.statusCode = 400;
        throw error;
    }
    if (data.target_arm_id) {
        const armResult = await resolveDb(db).query(
            "SELECT id FROM arms WHERE id = $1 AND class_id = $2 AND school_id = $3 LIMIT 1",
            [data.target_arm_id, data.target_class_id, schoolId]
        );
        if (!armResult.rows.length) {
            const error = new Error("The selected arm does not belong to the selected class.");
            error.statusCode = 400;
            throw error;
        }
    }
};

const createAnnouncement = async (data, schoolId, db) => {
    await validateTarget(data, schoolId, db);
    const result = await resolveDb(db).query(
        `INSERT INTO announcements
            (school_id, title, message, audience, created_by, is_active, publish_date, expiry_date,
             is_pinned, attachment_url, attachment_label, target_class_id, target_arm_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [schoolId, data.title, data.message, data.audience, data.created_by, data.is_active,
            data.publish_date, data.expiry_date, data.is_pinned, data.attachment_url,
            data.attachment_label, data.target_class_id, data.target_arm_id]
    );
    return result.rows[0];
};

const getAnnouncementsForManagement = async (schoolId, db) => {
    const result = await resolveDb(db).query(
        `SELECT a.*, u.username AS created_by_username,
                c.class_name AS target_class_name, ar.arm_name AS target_arm_name,
                COALESCE((SELECT json_agg(json_build_object('id', aa.id, 'file_name', aa.file_name, 'mime_type', aa.mime_type, 'file_size', aa.file_size, 'created_at', aa.created_at) ORDER BY aa.created_at)
                          FROM announcement_attachments aa WHERE aa.school_id = a.school_id AND aa.announcement_id = a.id), '[]'::json) AS attachments
         FROM announcements a
         LEFT JOIN users u ON u.id = a.created_by AND u.school_id = a.school_id
         LEFT JOIN classes c ON c.id = a.target_class_id AND c.school_id = a.school_id
         LEFT JOIN arms ar ON ar.id = a.target_arm_id AND ar.school_id = a.school_id
         WHERE a.school_id = $1
         ORDER BY a.is_pinned DESC, a.created_at DESC, a.id DESC`,
        [schoolId]
    );
    return result.rows;
};

const getAnnouncementsForAudience = async (schoolId, audience, userId, db) => {
    const result = await resolveDb(db).query(
        `SELECT a.id, a.title, a.message, a.audience, a.publish_date, a.expiry_date,
                a.created_at, a.is_pinned, a.attachment_url, a.attachment_label,
                a.target_class_id, a.target_arm_id,
                c.class_name AS target_class_name, ar.arm_name AS target_arm_name,
                COALESCE((SELECT json_agg(json_build_object('id', aa.id, 'file_name', aa.file_name, 'mime_type', aa.mime_type, 'file_size', aa.file_size, 'created_at', aa.created_at) ORDER BY aa.created_at)
                          FROM announcement_attachments aa WHERE aa.school_id = a.school_id AND aa.announcement_id = a.id), '[]'::json) AS attachments,
                r.read_at, (r.id IS NOT NULL) AS is_read
         FROM announcements a
         LEFT JOIN announcement_reads r
           ON r.announcement_id = a.id AND r.school_id = a.school_id AND r.user_id = $3
         LEFT JOIN classes c ON c.id = a.target_class_id AND c.school_id = a.school_id
         LEFT JOIN arms ar ON ar.id = a.target_arm_id AND ar.school_id = a.school_id
         WHERE a.school_id = $1
           AND a.is_active = TRUE
           AND a.publish_date <= CURRENT_DATE
           AND (a.expiry_date IS NULL OR a.expiry_date >= CURRENT_DATE)
           AND (
                a.audience IN ('all', $2)
                OR (
                    a.audience = 'class' AND (
                        ($2 = 'students' AND EXISTS (
                            SELECT 1 FROM users su
                            JOIN students st ON st.id = su.student_id AND st.school_id = su.school_id
                            WHERE su.id = $3 AND su.school_id = a.school_id
                              AND st.class_id = a.target_class_id
                              AND (a.target_arm_id IS NULL OR st.arm_id = a.target_arm_id)
                        ))
                        OR ($2 = 'parents' AND EXISTS (
                            SELECT 1 FROM parents p
                            JOIN users pu ON pu.id = p.user_id AND pu.school_id = p.school_id
                            JOIN student_parents sp ON sp.parent_id = p.id
                            JOIN students st ON st.id = sp.student_id AND st.school_id = p.school_id
                            WHERE pu.id = $3 AND p.school_id = a.school_id
                              AND st.class_id = a.target_class_id
                              AND (a.target_arm_id IS NULL OR st.arm_id = a.target_arm_id)
                        ))
                        OR ($2 = 'teachers' AND EXISTS (
                            SELECT 1 FROM teachers t
                            JOIN users tu ON tu.id = t.user_id AND tu.school_id = a.school_id
                            JOIN teacher_assignments ta ON ta.teacher_id = t.id
                            WHERE tu.id = $3 AND ta.class_id = a.target_class_id
                              AND (a.target_arm_id IS NULL OR ta.arm_id = a.target_arm_id)
                        ))
                    )
                )
           )
         ORDER BY a.is_pinned DESC, a.publish_date DESC, a.created_at DESC, a.id DESC`,
        [schoolId, audience, userId]
    );
    return result.rows;
};

const updateAnnouncement = async (id, data, schoolId, db) => {
    await validateTarget(data, schoolId, db);
    const result = await resolveDb(db).query(
        `UPDATE announcements
         SET title = $1, message = $2, audience = $3, is_active = $4,
             publish_date = $5, expiry_date = $6, is_pinned = $7,
             attachment_url = $8, attachment_label = $9,
             target_class_id = $10, target_arm_id = $11,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $12 AND school_id = $13
         RETURNING *`,
        [data.title, data.message, data.audience, data.is_active, data.publish_date,
            data.expiry_date, data.is_pinned, data.attachment_url, data.attachment_label,
            data.target_class_id, data.target_arm_id, id, schoolId]
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

const markAnnouncementRead = async (id, schoolId, userId, db) => {
    const result = await resolveDb(db).query(
        `INSERT INTO announcement_reads (school_id, announcement_id, user_id)
         SELECT $1, a.id, $3
         FROM announcements a
         WHERE a.id = $2 AND a.school_id = $1
         ON CONFLICT (school_id, announcement_id, user_id)
         DO UPDATE SET read_at = COALESCE(announcement_reads.read_at, CURRENT_TIMESTAMP)
         RETURNING announcement_id, read_at`,
        [schoolId, id, userId]
    );
    return result.rows[0];
};

const markAllAnnouncementsRead = async (schoolId, userId, ids, db) => {
    if (!ids.length) return 0;
    const result = await resolveDb(db).query(
        `INSERT INTO announcement_reads (school_id, announcement_id, user_id)
         SELECT a.school_id, a.id, $2
         FROM announcements a
         WHERE a.school_id = $1 AND a.id = ANY($3::int[])
         ON CONFLICT (school_id, announcement_id, user_id) DO NOTHING
         RETURNING id`,
        [schoolId, userId, ids]
    );
    return result.rowCount;
};


const countAnnouncementAttachments = async (announcementId, schoolId, db) => {
    const result = await resolveDb(db).query(
        "SELECT COUNT(*)::int AS total FROM announcement_attachments WHERE announcement_id = $1 AND school_id = $2",
        [announcementId, schoolId]
    );
    return result.rows[0].total;
};

const createAnnouncementAttachment = async (announcementId, schoolId, userId, file, db) => {
    const result = await resolveDb(db).query(
        `INSERT INTO announcement_attachments
            (school_id, announcement_id, uploaded_by, file_name, mime_type, file_size, file_data)
         SELECT $1, a.id, $3, $4, $5, $6, $7
         FROM announcements a
         WHERE a.id = $2 AND a.school_id = $1
         RETURNING id, file_name, mime_type, file_size, created_at`,
        [schoolId, announcementId, userId, file.file_name, file.mime_type, file.file_size, file.file_data]
    );
    return result.rows[0];
};

const getAnnouncementAttachment = async (announcementId, attachmentId, schoolId, db) => {
    const result = await resolveDb(db).query(
        `SELECT id, announcement_id, school_id, file_name, mime_type, file_size, file_data, created_at
         FROM announcement_attachments
         WHERE id = $1 AND announcement_id = $2 AND school_id = $3
         LIMIT 1`,
        [attachmentId, announcementId, schoolId]
    );
    return result.rows[0];
};

const deleteAnnouncementAttachment = async (announcementId, attachmentId, schoolId, db) => {
    const result = await resolveDb(db).query(
        `DELETE FROM announcement_attachments
         WHERE id = $1 AND announcement_id = $2 AND school_id = $3
         RETURNING id`,
        [attachmentId, announcementId, schoolId]
    );
    return result.rows[0];
};

module.exports = {
    createAnnouncement,
    getAnnouncementsForManagement,
    getAnnouncementsForAudience,
    updateAnnouncement,
    deactivateAnnouncement,
    markAnnouncementRead,
    markAllAnnouncementsRead,
    countAnnouncementAttachments,
    createAnnouncementAttachment,
    getAnnouncementAttachment,
    deleteAnnouncementAttachment
};
