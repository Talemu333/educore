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

const getStudentPosition = async (

    studentId,

    classId,

    armId,

    sessionId,

    termId

) => {

    const query = `

        WITH ranked_students AS (

            SELECT

                sr.student_id,

                ROUND(AVG(sr.total_score), 2) AS average_score,

                RANK() OVER (

                    ORDER BY AVG(sr.total_score) DESC

                ) AS position,

                COUNT(*) OVER() AS class_size

            FROM student_results sr

            JOIN teacher_assignments ta

                ON ta.id = sr.teacher_assignment_id

            WHERE

                ta.class_id = $1

                AND ta.arm_id = $2

                AND sr.session_id = $3

                AND sr.term_id = $4

            GROUP BY sr.student_id

        )

        SELECT *

        FROM ranked_students

        WHERE student_id = $5;

    `;

    const result = await pool.query(

        query,

        [

            classId,

            armId,

            sessionId,

            termId,

            studentId

        ]

    );

    return result.rows[0];

};

const getStudentTranscript = async (studentId) => {

    const query = `

        SELECT

            s.id,

            s.admission_number,

            CONCAT(

                s.surname,

                ' ',

                s.first_name

            ) AS student_name,

            ac.id AS session_id,

            ac.session_name,

            t.id AS term_id,

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

        JOIN academic_sessions ac

            ON ac.id = sr.session_id

        JOIN terms t

            ON t.id = sr.term_id

        WHERE

            sr.student_id = $1

        ORDER BY

            ac.start_date,

            t.id,

            sub.subject_name;

    `;

    const result = await pool.query(query, [studentId]);

    return result.rows;

};

module.exports = {
    getStudentReport,
    getStudentPosition,
    getStudentTranscript
}

