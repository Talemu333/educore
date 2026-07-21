const pool = require("../config/database");

const createResult = async (data, client = pool) => {

    const query = `
        INSERT INTO student_results (

            student_id,

            teacher_assignment_id,

            session_id,

            term_id,

            ca_score,

            exam_score,

            total_score,

            grade,

            remark

        )

        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)

        RETURNING *;
    `;

    const values = [

        data.student_id,

        data.teacher_assignment_id,

        data.session_id,

        data.term_id,

        data.ca_score,

        data.exam_score,

        data.total_score,

        data.grade,

        data.remark

    ];

    const result = await client.query(query, values);

    return result.rows[0];

};

const getResultById = async (id) => {

    const query = `
        SELECT

            sr.id,

            s.admission_number,

            CONCAT(
                s.surname,
                ' ',
                s.first_name
            ) AS student_name,

            sub.subject_name,

            c.class_name,

            a.arm_name,

            ac.session_name,

            t.term_name,

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

        WHERE sr.id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];

};

module.exports = {

    createResult,
    getResultById

};