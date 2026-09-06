const pool = require("../config/database");

const getExams = async (schoolId, filters = {}) => {
    const values = [schoolId];
    const conditions = ["e.school_id = $1"];
    let i = 2;

    if (filters.classId) { conditions.push(`e.class_id = $${i++}`); values.push(filters.classId); }
    if (filters.subjectId) { conditions.push(`e.subject_id = $${i++}`); values.push(filters.subjectId); }
    if (filters.status) { conditions.push(`e.status = $${i++}`); values.push(filters.status); }

    const result = await pool.query(`
        SELECT e.*, s.subject_name, c.class_name, a.arm_name, u.username AS creator_name
        FROM cbt_exams e
        JOIN subjects s ON s.id = e.subject_id AND s.school_id = e.school_id
        JOIN classes c ON c.id = e.class_id AND c.school_id = e.school_id
        LEFT JOIN arms a ON a.id = e.arm_id AND a.school_id = e.school_id
        JOIN users u ON u.id = e.created_by AND u.school_id = e.school_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY e.created_at DESC, e.id DESC;
    `, values);
    return result.rows;
};

const getAvailableStudentExams = async (studentId, schoolId) => {
    const result = await pool.query(`
        SELECT e.id, e.title, e.description, e.duration_minutes, e.total_marks,
               e.pass_mark, e.max_attempts, e.randomize_questions,
               e.randomize_options, e.show_result_immediately, e.starts_at,
               e.ends_at, s.subject_name, c.class_name, a.arm_name,
               COALESCE(att.attempt_count, 0) AS attempt_count
        FROM cbt_exams e
        JOIN students st
          ON st.id = $1
         AND st.school_id = $2
         AND st.class_id = e.class_id
         AND (e.arm_id IS NULL OR e.arm_id = st.arm_id)
        JOIN subjects s ON s.id = e.subject_id AND s.school_id = e.school_id
        JOIN classes c ON c.id = e.class_id AND c.school_id = e.school_id
        LEFT JOIN arms a ON a.id = e.arm_id AND a.school_id = e.school_id
        LEFT JOIN (
            SELECT exam_id, COUNT(*)::int AS attempt_count
            FROM cbt_attempts
            WHERE student_id = $1 AND school_id = $2
            GROUP BY exam_id
        ) att ON att.exam_id = e.id
        WHERE e.school_id = $2
          AND e.status = 'published'
          AND (e.starts_at IS NULL OR e.starts_at <= CURRENT_TIMESTAMP)
          AND (e.ends_at IS NULL OR e.ends_at >= CURRENT_TIMESTAMP)
        ORDER BY e.starts_at NULLS FIRST, e.created_at DESC, e.id DESC;
    `, [studentId, schoolId]);
    return result.rows;
};

const getExamById = async (examId, schoolId) => {
    const result = await pool.query(`
        SELECT e.*, s.subject_name, c.class_name, a.arm_name
        FROM cbt_exams e
        JOIN subjects s ON s.id = e.subject_id AND s.school_id = e.school_id
        JOIN classes c ON c.id = e.class_id AND c.school_id = e.school_id
        LEFT JOIN arms a ON a.id = e.arm_id AND a.school_id = e.school_id
        WHERE e.id = $1 AND e.school_id = $2;
    `, [examId, schoolId]);
    return result.rows[0];
};

const createExam = async (data, schoolId, userId) => {
    const result = await pool.query(`
        INSERT INTO cbt_exams (
            school_id, subject_id, class_id, arm_id, title, description,
            duration_minutes, total_marks, pass_mark, max_attempts,
            randomize_questions, randomize_options, show_result_immediately,
            starts_at, ends_at, status, created_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        RETURNING *;
    `, [
        schoolId, data.subject_id, data.class_id, data.arm_id || null,
        data.title, data.description || null, data.duration_minutes,
        data.total_marks || 0, data.pass_mark || 0, data.max_attempts || 1,
        Boolean(data.randomize_questions), Boolean(data.randomize_options),
        data.show_result_immediately !== false, data.starts_at || null,
        data.ends_at || null, data.status || "draft", userId
    ]);
    return result.rows[0];
};

const updateExam = async (examId, data, schoolId) => {
    const result = await pool.query(`
        UPDATE cbt_exams SET
            subject_id=$3, class_id=$4, arm_id=$5, title=$6, description=$7,
            duration_minutes=$8, total_marks=$9, pass_mark=$10, max_attempts=$11,
            randomize_questions=$12, randomize_options=$13,
            show_result_immediately=$14, starts_at=$15, ends_at=$16,
            status=$17, updated_at=CURRENT_TIMESTAMP
        WHERE id=$1 AND school_id=$2
        RETURNING *;
    `, [
        examId, schoolId, data.subject_id, data.class_id, data.arm_id || null,
        data.title, data.description || null, data.duration_minutes,
        data.total_marks || 0, data.pass_mark || 0, data.max_attempts || 1,
        Boolean(data.randomize_questions), Boolean(data.randomize_options),
        data.show_result_immediately !== false, data.starts_at || null,
        data.ends_at || null, data.status || "draft"
    ]);
    return result.rows[0];
};

const deleteExam = async (examId, schoolId) => {
    const result = await pool.query(
        "DELETE FROM cbt_exams WHERE id=$1 AND school_id=$2 RETURNING id",
        [examId, schoolId]
    );
    return result.rows[0];
};

const getQuestions = async (examId, schoolId, randomSeed = null) => {
    const randomQuestions = randomSeed !== null;
    const questionOrder = randomQuestions ? "md5(q.id::text || $3::text)" : "q.question_order";
    const optionOrder = randomQuestions ? "md5(o.id::text || $3::text)" : "o.option_order";
    const values = randomQuestions ? [examId, schoolId, String(randomSeed)] : [examId, schoolId];

    const result = await pool.query(`
        SELECT q.id, q.question_text, q.image_url, q.marks, q.question_order, q.explanation,
               COALESCE(json_agg(
                   json_build_object('id',o.id,'option_text',o.option_text,'option_image_url',o.option_image_url,'option_order',o.option_order,'is_correct',o.is_correct)
                   ORDER BY ${optionOrder}
               ) FILTER (WHERE o.id IS NOT NULL), '[]') AS options
        FROM cbt_questions q
        JOIN cbt_exams e ON e.id=q.exam_id AND e.school_id=$2
        LEFT JOIN cbt_question_options o ON o.question_id=q.id
        WHERE q.exam_id=$1 AND q.school_id=$2
        GROUP BY q.id
        ORDER BY ${questionOrder};
    `, values);
    return result.rows;
};

const createQuestion = async (data, schoolId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const question = await client.query(`
            INSERT INTO cbt_questions (school_id, exam_id, question_text, image_url, marks, question_order, explanation)
            SELECT $1,$2,$3,$4,$5,$6,$7 WHERE EXISTS (SELECT 1 FROM cbt_exams WHERE id=$2 AND school_id=$1)
            RETURNING *;
        `, [schoolId, data.exam_id, data.question_text, data.image_url || null, data.marks || 1, data.question_order, data.explanation || null]);
        if (!question.rows[0]) throw new Error("Exam not found for this school.");
        for (const option of data.options || []) {
            await client.query(`
                INSERT INTO cbt_question_options (question_id, option_text, option_image_url, option_order, is_correct)
                VALUES ($1,$2,$3,$4,$5)
            `, [question.rows[0].id, option.option_text, option.option_image_url || null, option.option_order, Boolean(option.is_correct)]);
        }
        await client.query("COMMIT");
        return question.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally { client.release(); }
};

const updateQuestion = async (questionId, data, schoolId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const question = await client.query(`
            UPDATE cbt_questions q SET question_text=$3,image_url=$4,marks=$5,question_order=$6,explanation=$7,updated_at=CURRENT_TIMESTAMP
            FROM cbt_exams e
            WHERE q.id=$1 AND q.school_id=$2 AND e.id=q.exam_id AND e.school_id=$2
            RETURNING q.*;
        `, [questionId, schoolId, data.question_text, data.image_url || null, data.marks || 1, data.question_order, data.explanation || null]);
        if (!question.rows[0]) return null;
        if (Array.isArray(data.options)) {
            await client.query("DELETE FROM cbt_question_options WHERE question_id=$1", [questionId]);
            for (const option of data.options) {
                await client.query(`INSERT INTO cbt_question_options (question_id,option_text,option_image_url,option_order,is_correct) VALUES ($1,$2,$3,$4,$5)`, [questionId, option.option_text, option.option_image_url || null, option.option_order, Boolean(option.is_correct)]);
            }
        }
        await client.query("COMMIT");
        return question.rows[0];
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
};

const deleteQuestion = async (questionId, schoolId) => {
    const result = await pool.query(`DELETE FROM cbt_questions q USING cbt_exams e WHERE q.id=$1 AND q.school_id=$2 AND e.id=q.exam_id AND e.school_id=$2 RETURNING q.id`, [questionId, schoolId]);
    return result.rows[0];
};

const startAttempt = async (examId, studentId, schoolId) => {
    const exam = await getExamById(examId, schoolId);
    if (!exam) throw new Error("Examination not found.");
    if (exam.status !== "published") throw new Error("This examination is not available.");
    if (exam.starts_at && new Date(exam.starts_at) > new Date()) throw new Error("This examination has not started yet.");
    if (exam.ends_at && new Date(exam.ends_at) < new Date()) throw new Error("This examination has ended.");

    const student = await pool.query("SELECT id, class_id, arm_id FROM students WHERE id=$1 AND school_id=$2", [studentId, schoolId]);
    if (!student.rows[0]) throw new Error("Student not found for this school.");
    if (Number(student.rows[0].class_id) !== Number(exam.class_id) || (exam.arm_id && Number(student.rows[0].arm_id) !== Number(exam.arm_id))) {
        throw new Error("This examination is not assigned to your class.");
    }

    const count = await pool.query("SELECT COUNT(*)::int AS count FROM cbt_attempts WHERE exam_id=$1 AND student_id=$2 AND school_id=$3", [examId, studentId, schoolId]);
    const attemptNumber = count.rows[0].count + 1;
    if (attemptNumber > exam.max_attempts) throw new Error("Maximum attempts reached.");

    const result = await pool.query(`
        INSERT INTO cbt_attempts (school_id,exam_id,student_id,attempt_number,expires_at)
        VALUES ($1,$2,$3,$4,CURRENT_TIMESTAMP + ($5 || ' minutes')::interval) RETURNING *;
    `, [schoolId, examId, studentId, attemptNumber, exam.duration_minutes]);
    return result.rows[0];
};

const saveAnswer = async (attemptId, questionId, selectedOptionId, schoolId) => {
    const result = await pool.query(`
        INSERT INTO cbt_answers (attempt_id,question_id,selected_option_id,answered_at)
        SELECT a.id,q.id,$3,CURRENT_TIMESTAMP
        FROM cbt_attempts a JOIN cbt_questions q ON q.id=$2 AND q.exam_id=a.exam_id AND q.school_id=$4
        WHERE a.id=$1 AND a.school_id=$4 AND a.status='in_progress'
        ON CONFLICT (attempt_id,question_id) DO UPDATE SET selected_option_id=EXCLUDED.selected_option_id,answered_at=CURRENT_TIMESTAMP
        RETURNING *;
    `, [attemptId, questionId, selectedOptionId || null, schoolId]);
    return result.rows[0];
};

const submitAttempt = async (attemptId, studentId, schoolId) => {
    const result = await pool.query(`
        WITH scored AS (
            SELECT a.id AS answer_id, q.marks, CASE WHEN o.is_correct THEN true ELSE false END AS correct
            FROM cbt_answers a
            JOIN cbt_questions q ON q.id=a.question_id
            LEFT JOIN cbt_question_options o ON o.id=a.selected_option_id
            JOIN cbt_attempts at ON at.id=a.attempt_id
            WHERE a.attempt_id=$1 AND at.student_id=$2 AND at.school_id=$3
        ), totals AS (
            SELECT COALESCE(SUM(CASE WHEN correct THEN marks ELSE 0 END),0) AS score,
                   COUNT(*) FILTER (WHERE correct) AS correct,
                   COUNT(*) FILTER (WHERE NOT correct) AS wrong
            FROM scored
        ), qcount AS (
            SELECT COUNT(*)::int AS total FROM cbt_questions q JOIN cbt_attempts a ON a.exam_id=q.exam_id WHERE a.id=$1
        ), updated_answers AS (
            UPDATE cbt_answers a SET is_correct=s.correct, marks_awarded=CASE WHEN s.correct THEN s.marks ELSE 0 END
            FROM scored s WHERE a.id=s.answer_id RETURNING a.id
        )
        UPDATE cbt_attempts a SET status=CASE WHEN a.expires_at <= CURRENT_TIMESTAMP THEN 'expired' ELSE 'submitted' END,
            submitted_at=CURRENT_TIMESTAMP, score=t.score, percentage=CASE WHEN e.total_marks > 0 THEN ROUND((t.score/e.total_marks)*100,2) ELSE 0 END,
            correct_answers=t.correct, wrong_answers=t.wrong, unanswered=GREATEST(q.total - (t.correct+t.wrong),0), updated_at=CURRENT_TIMESTAMP
        FROM totals t, qcount q, cbt_exams e
        WHERE a.id=$1 AND a.student_id=$2 AND a.school_id=$3 AND e.id=a.exam_id
        RETURNING a.*;
    `, [attemptId, studentId, schoolId]);
    return result.rows[0];
};

const getStudentAttempts = async (studentId, schoolId) => {
    const result = await pool.query(`
        SELECT a.*, e.title, e.total_marks, e.pass_mark, s.subject_name
        FROM cbt_attempts a JOIN cbt_exams e ON e.id=a.exam_id AND e.school_id=a.school_id
        JOIN subjects s ON s.id=e.subject_id AND s.school_id=e.school_id
        WHERE a.student_id=$1 AND a.school_id=$2 ORDER BY a.created_at DESC;
    `, [studentId, schoolId]);
    return result.rows;
};

const getAttemptForStudent = async (attemptId, studentId, schoolId) => {
    const result = await pool.query(
        `SELECT a.* FROM cbt_attempts a WHERE a.id=$1 AND a.student_id=$2 AND a.school_id=$3`,
        [attemptId, studentId, schoolId]
    );
    return result.rows[0];
};

module.exports = { getExams, getAvailableStudentExams, getExamById, createExam, updateExam, deleteExam, getQuestions, createQuestion, updateQuestion, deleteQuestion, startAttempt, saveAnswer, submitAttempt, getStudentAttempts, getAttemptForStudent };
