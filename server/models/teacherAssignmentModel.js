const pool = require("../config/database");

const createAssignment = async (assignmentData) => {

    const query = `

        INSERT INTO teacher_assignments (

            teacher_id,

            subject_id,

            class_id,

            arm_id,

            session_id,

            term_id

        )

        VALUES ($1,$2,$3,$4,$5,$6)

        RETURNING *;

    `;

    const values = [

        assignmentData.teacher_id,

        assignmentData.subject_id,

        assignmentData.class_id,

        assignmentData.arm_id,

        assignmentData.session_id,

        assignmentData.term_id

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

};

const getAssignmentById = async (id) => {

    const query = `
        SELECT

            ta.id,

            t.staff_number,

            CONCAT(
                t.surname,
                ' ',
                t.first_name
            ) AS teacher_name,

            s.subject_name,

            c.class_name,

            a.arm_name,

            ac.session_name,

            tr.term_name

        FROM teacher_assignments ta

        JOIN teachers t
            ON ta.teacher_id = t.id

        JOIN subjects s
            ON ta.subject_id = s.id

        JOIN classes c
            ON ta.class_id = c.id

        LEFT JOIN arms a
            ON ta.arm_id = a.id

        JOIN academic_sessions ac
            ON ta.session_id = ac.id

        JOIN terms tr
            ON ta.term_id = tr.id

        WHERE ta.id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];

};

const getAssignmentsByTeacher = async (teacherId) => {

    const query = `
        SELECT

            ta.id,

            s.subject_name,

            c.class_name,

            a.arm_name,

            tr.term_name,

            ac.session_name

        FROM teacher_assignments ta

        JOIN subjects s
            ON ta.subject_id = s.id

        JOIN classes c
            ON ta.class_id = c.id

        LEFT JOIN arms a
            ON ta.arm_id = a.id

        JOIN terms tr
            ON ta.term_id = tr.id

        JOIN academic_sessions ac
            ON ta.session_id = ac.id

        WHERE ta.teacher_id = $1

        ORDER BY
            ac.session_name DESC,
            tr.id,
            c.class_name,
            s.subject_name;

    `;

    const result = await pool.query(query, [teacherId]);

    return result.rows;

};

const getAssignmentDetails = async (id) => {

    const query = `
        SELECT *

        FROM teacher_assignments

        WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];

};

module.exports = {

    createAssignment,
    getAssignmentById,
    getAssignmentsByTeacher,
    getAssignmentDetails

};