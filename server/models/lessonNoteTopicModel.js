const pool = require("../config/database");

const columns = `
    lnt.id, lnt.school_id, lnt.session_id, lnt.term_id, lnt.class_id, lnt.subject_id,
    lnt.week_number, lnt.topic, lnt.sub_topic, lnt.sort_order, lnt.created_at, lnt.updated_at,
    c.class_name, s.subject_name, ac.session_name, tr.term_name,
    COUNT(DISTINCT ln.id)::integer AS lesson_note_count
`;

const list = async (filters, schoolId, user) => {
    const values = [schoolId];
    const where = ["lnt.school_id = $1"];

    if (filters.session_id) { values.push(filters.session_id); where.push(`lnt.session_id = $${values.length}`); }
    if (filters.term_id) { values.push(filters.term_id); where.push(`lnt.term_id = $${values.length}`); }
    if (filters.class_id) { values.push(filters.class_id); where.push(`lnt.class_id = $${values.length}`); }
    if (filters.subject_id) { values.push(filters.subject_id); where.push(`lnt.subject_id = $${values.length}`); }
    if (filters.week_number) { values.push(filters.week_number); where.push(`lnt.week_number = $${values.length}`); }

    if (user?.role_name === "Teacher") {
        values.push(user.id);
        where.push(`EXISTS (
            SELECT 1
            FROM teacher_assignments ta
            JOIN teachers tt ON tt.id = ta.teacher_id
            JOIN users tu ON tu.id = tt.user_id AND tu.school_id = $1
            WHERE ta.teacher_id = tt.id
              AND tt.user_id = $${values.length}
              AND ta.class_id = lnt.class_id
              AND ta.subject_id = lnt.subject_id
              AND ta.session_id = lnt.session_id
              AND ta.term_id = lnt.term_id
        )`);
    }

    const result = await pool.query(`
        SELECT ${columns}
        FROM lesson_note_topics lnt
        JOIN classes c ON c.id = lnt.class_id
        JOIN subjects s ON s.id = lnt.subject_id
        JOIN academic_sessions ac ON ac.id = lnt.session_id
        JOIN terms tr ON tr.id = lnt.term_id
        LEFT JOIN lesson_notes ln
          ON ln.school_id = lnt.school_id
         AND ln.session_id = lnt.session_id
         AND ln.term_id = lnt.term_id
         AND ln.class_id = lnt.class_id
         AND ln.subject_id = lnt.subject_id
         AND ln.week_number = lnt.week_number
         AND ln.topic = lnt.topic
        WHERE ${where.join(" AND ")}
        GROUP BY lnt.id, c.class_name, s.subject_name, ac.session_name, tr.term_name
        ORDER BY lnt.session_id DESC, lnt.term_id, lnt.class_id, lnt.subject_id, lnt.week_number, lnt.sort_order, lnt.id
    `, values);

    return result.rows;
};

const getById = async (id, schoolId) => {
    const result = await pool.query(`
        SELECT ${columns}
        FROM lesson_note_topics lnt
        JOIN classes c ON c.id = lnt.class_id
        JOIN subjects s ON s.id = lnt.subject_id
        JOIN academic_sessions ac ON ac.id = lnt.session_id
        JOIN terms tr ON tr.id = lnt.term_id
        LEFT JOIN lesson_notes ln
          ON ln.school_id = lnt.school_id
         AND ln.session_id = lnt.session_id
         AND ln.term_id = lnt.term_id
         AND ln.class_id = lnt.class_id
         AND ln.subject_id = lnt.subject_id
         AND ln.week_number = lnt.week_number
         AND ln.topic = lnt.topic
        WHERE lnt.id = $1 AND lnt.school_id = $2
        GROUP BY lnt.id, c.class_name, s.subject_name, ac.session_name, tr.term_name
    `, [id, schoolId]);
    return result.rows[0] || null;
};

const create = async (data, schoolId) => {
    const result = await pool.query(`
        INSERT INTO lesson_note_topics
            (school_id, session_id, term_id, class_id, subject_id, week_number, topic, sub_topic, sort_order)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING id
    `, [schoolId, data.session_id, data.term_id, data.class_id, data.subject_id, data.week_number, data.topic, data.sub_topic || null, data.sort_order || 0]);
    return getById(result.rows[0].id, schoolId);
};

const update = async (id, data, schoolId) => {
    const result = await pool.query(`
        UPDATE lesson_note_topics
        SET session_id=$1, term_id=$2, class_id=$3, subject_id=$4, week_number=$5,
            topic=$6, sub_topic=$7, sort_order=$8
        WHERE id=$9 AND school_id=$10
        RETURNING id
    `, [data.session_id, data.term_id, data.class_id, data.subject_id, data.week_number, data.topic, data.sub_topic || null, data.sort_order || 0, id, schoolId]);
    return result.rows[0] ? getById(result.rows[0].id, schoolId) : null;
};

const remove = async (id, schoolId) => {
    const result = await pool.query(`DELETE FROM lesson_note_topics WHERE id=$1 AND school_id=$2 RETURNING id`, [id, schoolId]);
    return Boolean(result.rows[0]);
};

module.exports = { list, getById, create, update, remove };
