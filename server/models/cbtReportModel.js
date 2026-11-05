const pool = require("../config/database");

const attemptMarksSql = `(SELECT COALESCE(SUM(q2.marks),0)::numeric FROM cbt_attempt_questions aq2 JOIN cbt_questions q2 ON q2.id=aq2.question_id AND q2.school_id=a.school_id WHERE aq2.attempt_id=a.id AND aq2.school_id=a.school_id)`;
const attemptSubjectResultsSql = `(
    SELECT COALESCE(json_agg(json_build_object(
        'subject_id', subject_scores.subject_id,
        'subject_name', subject_scores.subject_name,
        'section_title', subject_scores.section_title,
        'score', subject_scores.score,
        'total_marks', subject_scores.total_marks,
        'percentage', CASE WHEN subject_scores.total_marks > 0
            THEN ROUND(subject_scores.score / subject_scores.total_marks * 100, 2)
            ELSE 0 END
    ) ORDER BY subject_scores.section_order), '[]'::json)
    FROM (
        SELECT q.subject_id, s.subject_name,
               COALESCE(es.section_title, s.subject_name) AS section_title,
               COALESCE(es.section_order, 1) AS section_order,
               COALESCE(SUM(q.marks), 0)::numeric AS total_marks,
               COALESCE(SUM(CASE WHEN ans.is_correct THEN ans.marks_awarded ELSE 0 END), 0)::numeric AS score
        FROM cbt_attempt_questions aq
        JOIN cbt_questions q ON q.id=aq.question_id AND q.school_id=aq.school_id
        JOIN subjects s ON s.id=q.subject_id AND s.school_id=q.school_id
        LEFT JOIN cbt_exam_subjects es
          ON es.exam_id=q.exam_id AND es.school_id=q.school_id AND es.subject_id=q.subject_id
        LEFT JOIN cbt_answers ans ON ans.attempt_id=aq.attempt_id AND ans.question_id=aq.question_id
        WHERE aq.attempt_id=a.id AND aq.school_id=a.school_id
        GROUP BY q.subject_id,s.subject_name,es.section_title,es.section_order
    ) subject_scores
)`;

const getAttemptsReport = async (schoolId, filters = {}) => {
    const values = [schoolId];
    const conditions = ["a.school_id = $1"];
    let i = 2;
    if (filters.examId) { conditions.push(`a.exam_id = $${i++}`); values.push(filters.examId); }
    if (filters.studentId) { conditions.push(`a.student_id = ${i++}`); values.push(filters.studentId); }
    if (filters.classId) { conditions.push(`e.class_id = ${i++}`); values.push(filters.classId); }
    if (filters.subjectId) { conditions.push(`EXISTS (SELECT 1 FROM cbt_exam_subjects es WHERE es.exam_id=e.id AND es.school_id=e.school_id AND es.subject_id=${i++})`); values.push(filters.subjectId); }

    const result = await pool.query(`
        SELECT a.id, a.exam_id, a.student_id, a.attempt_number, a.status,
               a.started_at, a.submitted_at, a.expires_at, a.score,
               a.percentage, a.correct_answers, a.wrong_answers, a.unanswered,
               e.title, e.total_marks AS exam_total_marks,
               ${attemptMarksSql} AS total_marks,
               e.pass_mark, e.class_id, c.class_name, e.subject_id, s.subject_name,\n               ${attemptSubjectResultsSql} AS subject_results,
               st.admission_number, st.surname, st.first_name, st.middle_name
        FROM cbt_attempts a
        JOIN cbt_exams e ON e.id=a.exam_id AND e.school_id=a.school_id
        JOIN subjects s ON s.id=e.subject_id AND s.school_id=e.school_id
        JOIN classes c ON c.id=e.class_id AND c.school_id=e.school_id
        JOIN students st ON st.id=a.student_id AND st.school_id=a.school_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY a.created_at DESC, a.id DESC;
    `, values);
    return result.rows;
};

const getAttemptDetails = async (attemptId, schoolId) => {
    const attempt = await pool.query(`
        SELECT a.*, e.title, e.total_marks AS exam_total_marks,
               ${attemptMarksSql} AS total_marks,
               e.pass_mark, e.show_result_immediately,
               s.subject_name, st.admission_number, st.surname, st.first_name, st.middle_name
        FROM cbt_attempts a
        JOIN cbt_exams e ON e.id=a.exam_id AND e.school_id=a.school_id
        JOIN subjects s ON s.id=e.subject_id AND s.school_id=e.school_id
        JOIN students st ON st.id=a.student_id AND st.school_id=a.school_id
        WHERE a.id=$1 AND a.school_id=$2;
    `, [attemptId, schoolId]);
    if (!attempt.rows[0]) return null;

    const answers = await pool.query(`
        SELECT ans.id, ans.question_id, ans.selected_option_id, ans.is_correct,
               ans.marks_awarded, q.question_text, q.marks,
               so.option_text AS selected_option_text,
               co.option_text AS correct_option_text
        FROM cbt_answers ans
        JOIN cbt_questions q ON q.id=ans.question_id AND q.school_id=$2
        LEFT JOIN cbt_question_options so ON so.id=ans.selected_option_id
        LEFT JOIN cbt_question_options co ON co.question_id=q.id AND co.is_correct=true
        WHERE ans.attempt_id=$1
        ORDER BY q.question_order;
    `, [attemptId, schoolId]);

    return { ...attempt.rows[0], answers: answers.rows };
};

const getExamPerformance = async (examId, schoolId) => {
    const result = await pool.query(`
        SELECT COUNT(*)::int AS attempts,
               COUNT(*) FILTER (WHERE a.status IN ('submitted','expired'))::int AS completed,
               COUNT(*) FILTER (WHERE a.status='in_progress')::int AS in_progress,
               COUNT(*) FILTER (WHERE a.percentage >= e.pass_mark AND a.status IN ('submitted','expired'))::int AS passed,
               COUNT(*) FILTER (WHERE a.percentage < e.pass_mark AND a.status IN ('submitted','expired'))::int AS failed,
               COALESCE(ROUND(AVG(a.percentage) FILTER (WHERE a.status IN ('submitted','expired')),2),0) AS average_percentage,
               COALESCE(MAX(a.percentage) FILTER (WHERE a.status IN ('submitted','expired')),0) AS highest_percentage,
               COALESCE(MIN(a.percentage) FILTER (WHERE a.status IN ('submitted','expired')),0) AS lowest_percentage
        FROM cbt_exams e
        LEFT JOIN cbt_attempts a ON a.exam_id=e.id AND a.school_id=e.school_id
        WHERE e.id=$1 AND e.school_id=$2
        GROUP BY e.id;
    `, [examId, schoolId]);
    return result.rows[0] || null;
};

module.exports = { getAttemptsReport, getAttemptDetails, getExamPerformance };
