const pool = require("../config/database");

const getPromotionHistory = async ({
    schoolId,
    action,
    sessionId,
    search,
    page = 1,
    limit = 20
}) => {
    if (!schoolId) {
        throw new Error("School context is required to load promotion history.");
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const offset = (currentPage - 1) * pageLimit;

    const values = [Number(schoolId)];
    const conditions = ["s.school_id = $1"];

    if (action) {
        values.push(action);
        conditions.push(`h.action = $${values.length}`);
    }

    if (sessionId) {
        values.push(Number(sessionId));
        conditions.push(`(
            h.from_session_id = $${values.length}
            OR h.to_session_id = $${values.length}
        )`);
    }

    if (search) {
        values.push(`%${search.trim()}%`);
        const p = `$${values.length}`;
        conditions.push(`(
            s.admission_number ILIKE ${p}
            OR s.surname ILIKE ${p}
            OR s.first_name ILIKE ${p}
            OR s.middle_name ILIKE ${p}
            OR CONCAT(s.surname, ' ', s.first_name, ' ', COALESCE(s.middle_name, '')) ILIKE ${p}
        )`);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const countResult = await pool.query(`
        SELECT COUNT(*) AS total
        FROM student_promotion_history h
        INNER JOIN students s ON s.id = h.student_id
        ${whereClause};
    `, values);

    const total = Number(countResult.rows[0]?.total || 0);
    const dataValues = [...values, pageLimit, offset];
    const limitParameter = `$${values.length + 1}`;
    const offsetParameter = `$${values.length + 2}`;

    const historyResult = await pool.query(`
        SELECT
            h.id,
            h.action,
            h.remarks,
            h.processed_at,
            s.id AS student_id,
            s.admission_number,
            s.surname,
            s.first_name,
            s.middle_name,
            s.gender,
            fs.id AS from_session_id,
            fs.session_name AS from_session_name,
            ts.id AS to_session_id,
            ts.session_name AS to_session_name,
            fc.id AS from_class_id,
            fc.class_name AS from_class_name,
            tc.id AS to_class_id,
            tc.class_name AS to_class_name,
            fa.id AS from_arm_id,
            fa.arm_name AS from_arm_name,
            ta.id AS to_arm_id,
            ta.arm_name AS to_arm_name,
            u.id AS processed_by,
            u.username AS processed_by_username,
            u.email AS processed_by_email,
            u.admin_type AS processed_by_admin_type
        FROM student_promotion_history h
        INNER JOIN students s ON s.id = h.student_id
        INNER JOIN academic_sessions fs ON fs.id = h.from_session_id
        LEFT JOIN academic_sessions ts ON ts.id = h.to_session_id
        INNER JOIN classes fc ON fc.id = h.from_class_id
        LEFT JOIN classes tc ON tc.id = h.to_class_id
        LEFT JOIN arms fa ON fa.id = h.from_arm_id
        LEFT JOIN arms ta ON ta.id = h.to_arm_id
        LEFT JOIN users u ON u.id = h.processed_by
        ${whereClause}
        ORDER BY h.processed_at DESC, h.id DESC
        LIMIT ${limitParameter}
        OFFSET ${offsetParameter};
    `, dataValues);

    return {
        history: historyResult.rows,
        pagination: {
            page: currentPage,
            limit: pageLimit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / pageLimit)
        }
    };
};

module.exports = { getPromotionHistory };
