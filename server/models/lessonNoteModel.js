const pool = require("../config/database");

const columns = `
    ln.id, ln.school_id, ln.teacher_id, ln.class_id, ln.subject_id,
    ln.session_id, ln.term_id, ln.week_number, ln.lesson_date, ln.topic,
    ln.sub_topic, ln.duration, ln.objectives, ln.instructional_materials,
    ln.previous_knowledge, ln.introduction, ln.lesson_development,
    ln.teacher_activities, ln.student_activities, ln.evaluation,
    ln.conclusion, ln.assignment, ln."references", ln.remarks, ln.status,
    ln.reviewed_by, ln.reviewed_at, ln.review_comment, ln.created_at, ln.updated_at,
    CONCAT(t.surname, ' ', t.first_name) AS teacher_name,
    c.class_name, s.subject_name, ac.session_name, tr.term_name,
    CONCAT(COALESCE(rv.surname, ''), CASE WHEN rv.first_name IS NULL THEN '' ELSE ' ' || rv.first_name END) AS reviewer_name
`;

const getById = async (id, schoolId) => {
    const result = await pool.query(`
        SELECT ${columns}
        FROM lesson_notes ln
        JOIN teachers t ON t.id = ln.teacher_id
        JOIN users tu ON tu.id = t.user_id AND tu.school_id = $2
        JOIN classes c ON c.id = ln.class_id
        JOIN subjects s ON s.id = ln.subject_id
        JOIN academic_sessions ac ON ac.id = ln.session_id
        JOIN terms tr ON tr.id = ln.term_id
        LEFT JOIN users rv ON rv.id = ln.reviewed_by
        WHERE ln.id = $1 AND ln.school_id = $2
    `, [id, schoolId]);
    return result.rows[0];
};

const list = async (filters, schoolId, user) => {
    const values = [schoolId];
    const where = ["ln.school_id = $1"];
    const role = user?.role_name;

    if (role === "Teacher") {
        const teacherResult = await pool.query("SELECT id FROM teachers WHERE user_id = $1", [user.id]);
        const teacherId = teacherResult.rows[0]?.id;
        if (!teacherId) return [];
        values.push(teacherId);
        where.push(`ln.teacher_id = $${values.length}`);
    } else if (filters.teacher_id) {
        values.push(filters.teacher_id);
        where.push(`ln.teacher_id = $${values.length}`);
    }

    for (const [key, column] of [["class_id", "ln.class_id"], ["subject_id", "ln.subject_id"], ["session_id", "ln.session_id"], ["term_id", "ln.term_id"], ["week_number", "ln.week_number"], ["status", "ln.status"]]) {
        if (filters[key] !== undefined && filters[key] !== "") {
            values.push(filters[key]);
            where.push(`${column} = $${values.length}`);
        }
    }

    const result = await pool.query(`
        SELECT ${columns}
        FROM lesson_notes ln
        JOIN teachers t ON t.id = ln.teacher_id
        JOIN users tu ON tu.id = t.user_id AND tu.school_id = $1
        JOIN classes c ON c.id = ln.class_id
        JOIN subjects s ON s.id = ln.subject_id
        JOIN academic_sessions ac ON ac.id = ln.session_id
        JOIN terms tr ON tr.id = ln.term_id
        LEFT JOIN users rv ON rv.id = ln.reviewed_by
        WHERE ${where.join(" AND ")}
        ORDER BY ln.lesson_date DESC NULLS LAST, ln.week_number DESC, ln.updated_at DESC
    `, values);
    return result.rows;
};

const validateContext = async (data, schoolId) => {
    const result = await pool.query(`
        SELECT ta.id
        FROM teacher_assignments ta
        JOIN teachers t ON t.id = ta.teacher_id
        JOIN users u ON u.id = t.user_id AND u.school_id = $6
        WHERE ta.teacher_id = $1 AND ta.subject_id = $2 AND ta.class_id = $3
          AND ta.session_id = $4 AND ta.term_id = $5
        LIMIT 1
    `, [data.teacher_id, data.subject_id, data.class_id, data.session_id, data.term_id, schoolId]);
    return Boolean(result.rows[0]);
};

const create = async (data, schoolId) => {
    const result = await pool.query(`
        INSERT INTO lesson_notes (
            school_id, teacher_id, class_id, subject_id, session_id, term_id, week_number,
            lesson_date, topic, sub_topic, duration, objectives, instructional_materials,
            previous_knowledge, introduction, lesson_development, teacher_activities,
            student_activities, evaluation, conclusion, assignment, "references", remarks, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
        RETURNING id
    `, [schoolId, data.teacher_id, data.class_id, data.subject_id, data.session_id, data.term_id, data.week_number,
        data.lesson_date || null, data.topic, data.sub_topic || null, data.duration || null, data.objectives || null,
        data.instructional_materials || null, data.previous_knowledge || null, data.introduction || null,
        data.lesson_development || null, data.teacher_activities || null, data.student_activities || null,
        data.evaluation || null, data.conclusion || null, data.assignment || null, data.references || null,
        data.remarks || null, data.status || "draft"]);
    return getById(result.rows[0].id, schoolId);
};

const update = async (id, data, schoolId) => {
    const result = await pool.query(`
        UPDATE lesson_notes SET
            class_id=$1, subject_id=$2, session_id=$3, term_id=$4, week_number=$5, lesson_date=$6,
            topic=$7, sub_topic=$8, duration=$9, objectives=$10, instructional_materials=$11,
            previous_knowledge=$12, introduction=$13, lesson_development=$14, teacher_activities=$15,
            student_activities=$16, evaluation=$17, conclusion=$18, assignment=$19, "references"=$20,
            remarks=$21, status=$22, reviewed_by=NULL, reviewed_at=NULL, review_comment=NULL
        WHERE id=$23 AND school_id=$24
        RETURNING id
    `, [data.class_id, data.subject_id, data.session_id, data.term_id, data.week_number, data.lesson_date || null,
        data.topic, data.sub_topic || null, data.duration || null, data.objectives || null, data.instructional_materials || null,
        data.previous_knowledge || null, data.introduction || null, data.lesson_development || null,
        data.teacher_activities || null, data.student_activities || null, data.evaluation || null,
        data.conclusion || null, data.assignment || null, data.references || null, data.remarks || null,
        data.status || "draft", id, schoolId]);
    return result.rows[0] ? getById(result.rows[0].id, schoolId) : null;
};

const setStatus = async (id, status, reviewerId, comment, schoolId) => {
    const result = await pool.query(`UPDATE lesson_notes SET status=$1, reviewed_by=$2, reviewed_at=CURRENT_TIMESTAMP, review_comment=$3 WHERE id=$4 AND school_id=$5 RETURNING id`, [status, reviewerId || null, comment || null, id, schoolId]);
    return result.rows[0] ? getById(result.rows[0].id, schoolId) : null;
};

const duplicate = async (id, teacherId, schoolId) => {
    const source = await getById(id, schoolId);
    if (!source) return null;
    return create({
        teacher_id: teacherId, class_id: source.class_id, subject_id: source.subject_id,
        session_id: source.session_id, term_id: source.term_id, week_number: source.week_number,
        lesson_date: source.lesson_date, topic: source.topic, sub_topic: source.sub_topic,
        duration: source.duration, objectives: source.objectives, instructional_materials: source.instructional_materials,
        previous_knowledge: source.previous_knowledge, introduction: source.introduction, lesson_development: source.lesson_development,
        teacher_activities: source.teacher_activities, student_activities: source.student_activities,
        evaluation: source.evaluation, conclusion: source.conclusion, assignment: source.assignment,
        references: source.references, remarks: source.remarks, status: "draft"
    }, schoolId);
};

const getMeta = async (schoolId, user) => {
    const teacherIdResult = user?.role_name === "Teacher"
        ? await pool.query("SELECT id FROM teachers WHERE user_id=$1", [user.id])
        : { rows: [] };
    const teacherId = teacherIdResult.rows[0]?.id;

    // Assignments are kept separate from the basic academic options. This is
    // important for a newly provisioned isolated school database where a
    // teacher may not have an assignment yet, but the school still needs its
    // sessions, terms, classes and subjects to load.
    const assignments = await pool.query(`
        SELECT DISTINCT ta.teacher_id, ta.class_id, ta.subject_id, ta.session_id, ta.term_id,
            CONCAT(t.surname,' ',t.first_name) teacher_name, c.class_name, s.subject_name,
            ac.session_name, tr.term_name
        FROM teacher_assignments ta
        JOIN teachers t ON t.id=ta.teacher_id
        JOIN users u ON u.id=t.user_id AND u.school_id=$1
        JOIN classes c ON c.id=ta.class_id
        JOIN subjects s ON s.id=ta.subject_id
        JOIN academic_sessions ac ON ac.id=ta.session_id
        JOIN terms tr ON tr.id=ta.term_id
        WHERE ($2::integer IS NULL OR ta.teacher_id=$2)
        ORDER BY ac.session_name DESC, tr.id, c.class_name, s.subject_name
    `, [schoolId, teacherId || null]);

    const sessions = await pool.query(`
        SELECT id, session_name
        FROM academic_sessions
        ORDER BY session_name DESC
    `);

    const terms = await pool.query(`
        SELECT id, term_name, session_id
        FROM terms
        ORDER BY session_id DESC, id
    `);

    const classes = await pool.query(`
        SELECT id, class_name
        FROM classes
        WHERE school_id = $1
        ORDER BY class_name
    `, [schoolId]);

    const subjects = await pool.query(`
        SELECT id, subject_name
        FROM subjects
        WHERE school_id = $1
        ORDER BY subject_name
    `, [schoolId]);

    return {
        assignments: assignments.rows,
        sessions: sessions.rows,
        terms: terms.rows,
        classes: classes.rows,
        subjects: subjects.rows,
        teacher_id: teacherId || null
    };
};

module.exports = { getById, list, validateContext, create, update, setStatus, duplicate, getMeta };
