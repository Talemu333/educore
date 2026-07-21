const pool = require("../config/database");


const getStudentReport = async (
    studentId,
    sessionId,
    termId
) => {

    const query = `
        SELECT

            s.id,

            s.admission_number,

            CONCAT(
                s.surname,
                ' ',
                s.first_name
            ) AS student_name,

            c.class_name,

            a.arm_name,

            ac.session_name,

            t.term_name,

            sub.subject_name,

            sr.ca_score,

            sr.exam_score,

            sr.total_score,

            sr.grade,

            sr.remark

        FROM student_results sr

        JOIN students s
            ON s.id = sr.student_id

        JOIN teacher_assignments ta
            ON ta.id = sr.teacher_assignment_id

        JOIN subjects sub
            ON sub.id = ta.subject_id

        JOIN classes c
            ON c.id = ta.class_id

        LEFT JOIN arms a
            ON a.id = ta.arm_id

        JOIN academic_sessions ac
            ON ac.id = sr.session_id

        JOIN terms t
            ON t.id = sr.term_id

        WHERE

            sr.student_id = $1

            AND

            sr.session_id = $2

            AND

            sr.term_id = $3

        ORDER BY

            sub.subject_name;
    `;

    const result = await pool.query(query, [

        studentId,

        sessionId,

        termId

    ]);

    return result.rows;

};

module.exports = {
    getStudentReport
}

