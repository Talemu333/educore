const pool = require("../config/database");

const publishClassTermResults = async ({ schoolId, classId, armId, sessionId, termId, publishedBy }) => {
    const result = await pool.query(`
        INSERT INTO result_publications
            (school_id, class_id, arm_id, session_id, term_id, published_by)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (school_id, class_id, arm_id, session_id, term_id)
        DO UPDATE SET published_by=EXCLUDED.published_by, published_at=CURRENT_TIMESTAMP
        RETURNING *;
    `, [schoolId, classId, armId || null, sessionId, termId, publishedBy]);
    return result.rows[0];
};

const isStudentResultPublished = async (studentId, sessionId, termId, schoolId) => {
    const result = await pool.query(`
        SELECT 1
        FROM student_results sr
        JOIN teacher_assignments ta
          ON ta.id = sr.teacher_assignment_id
        JOIN students s
          ON s.id = sr.student_id
        JOIN result_publications rp
          ON rp.school_id = $4
         AND rp.class_id = ta.class_id
         AND (rp.arm_id = ta.arm_id OR (rp.arm_id IS NULL AND ta.arm_id IS NULL))
         AND rp.session_id = sr.session_id
         AND rp.term_id = sr.term_id
        WHERE sr.student_id = $1
          AND sr.session_id = $2
          AND sr.term_id = $3
          AND s.school_id = $4
        LIMIT 1;
    `, [studentId, sessionId, termId, schoolId]);
    return result.rows.length > 0;
};

const getPublication = async (schoolId, classId, armId, sessionId, termId) => {
    const result = await pool.query(`
        SELECT *
        FROM result_publications
        WHERE school_id=$1
          AND class_id=$2
          AND (arm_id=$3 OR (arm_id IS NULL AND $3 IS NULL))
          AND session_id=$4
          AND term_id=$5
        LIMIT 1;
    `, [schoolId, classId, armId || null, sessionId, termId]);
    return result.rows[0] || null;
};

module.exports = {
    publishClassTermResults,
    isStudentResultPublished,
    getPublication,
};
