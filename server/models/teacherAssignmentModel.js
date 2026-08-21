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

            ta.teacher_id,

            ta.subject_id,

            ta.class_id,

            ta.arm_id,

            ta.session_id,

            ta.term_id,

            CONCAT(
                t.surname,
                ' ',
                t.first_name
            ) AS teacher_name,

            s.subject_name,

            c.class_name,

            a.arm_name,

            tr.term_name,

            ac.session_name

        FROM teacher_assignments ta

        JOIN teachers t
            ON ta.teacher_id = t.id

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

    const result = await pool.query(
        query,
        [teacherId]
    );

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

const assignmentExists = async (assignment) => {

    const query = `

        SELECT id

        FROM teacher_assignments

        WHERE

            teacher_id = $1

        AND subject_id = $2

        AND class_id = $3

        AND

        (

            arm_id = $4

            OR

            (

                arm_id IS NULL

                AND

                $4 IS NULL

            )

        )

        AND session_id = $5

        AND term_id = $6;

    `;

    const values = [

        assignment.teacher_id,

        assignment.subject_id,

        assignment.class_id,

        assignment.arm_id,

        assignment.session_id,

        assignment.term_id

    ];

    const result = await pool.query(query, values);

    return result.rows.length > 0;

};

const deleteAssignment = async (id) => {

    const query = `

        DELETE

        FROM teacher_assignments

        WHERE id = $1

        RETURNING *;

    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];

};

const findDuplicateAssignment = async ({
    teacher_id,
    subject_id,
    class_id,
    arm_id,
    session_id,
    term_id
}) => {

    const query = `

        SELECT id

        FROM teacher_assignments

        WHERE teacher_id = $1
        AND subject_id = $2
        AND class_id = $3
        AND session_id = $4
        AND term_id = $5
        AND (
            arm_id = $6
            OR (arm_id IS NULL AND $6 IS NULL)
        )

        LIMIT 1;

    `;

    const values = [

        teacher_id,

        subject_id,

        class_id,

        session_id,

        term_id,

        arm_id

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

};

const updateAssignment = async (

    id,

    assignment

) => {

    const query = `

        UPDATE teacher_assignments

        SET

            teacher_id=$1,

            subject_id=$2,

            class_id=$3,

            arm_id=$4,

            session_id=$5,

            term_id=$6

        WHERE id=$7

        RETURNING *;

    `;

    const values = [

        assignment.teacher_id,

        assignment.subject_id,

        assignment.class_id,

        assignment.arm_id,

        assignment.session_id,

        assignment.term_id,

        id

    ];

    const result = await pool.query(

        query,

        values

    );

    return result.rows[0];

};

const getAllAssignments = async () => {

    const query = `

        SELECT

            ta.id,

            ta.teacher_id,

            ta.subject_id,

            ta.class_id,

            ta.arm_id,

            ta.session_id,

            ta.term_id,

            CONCAT(
                t.surname,
                ' ',
                t.first_name
            ) AS teacher_name,

            s.subject_name,

            c.class_name,

            a.arm_name,

            tr.term_name,

            ac.session_name

        FROM teacher_assignments ta

        JOIN teachers t
            ON ta.teacher_id = t.id

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

        ORDER BY

            ac.session_name DESC,

            tr.id,

            c.class_name,

            a.arm_name,

            s.subject_name;

    `;

    const result =
        await pool.query(query);

    return result.rows;

};

const getAssignmentForAttendance = async (id) => {

    const query = `

        SELECT

            ta.id,

            ta.teacher_id,

            ta.subject_id,
            s.subject_name,

            ta.class_id,
            c.class_name,

            ta.arm_id,
            a.arm_name,

            ta.session_id,
            ac.session_name,

            ta.term_id,
            tr.term_name

        FROM teacher_assignments ta

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

    const result =
        await pool.query(
            query,
            [id]
        );

    return result.rows[0];

};

const getStudentsByTeacher = async (teacherId) => {

    const query = `

        SELECT

            s.id,

            s.admission_number,

            CONCAT(
                s.surname,
                ' ',
                s.first_name,
                CASE
                    WHEN s.middle_name IS NOT NULL
                        AND s.middle_name <> ''
                    THEN ' ' || s.middle_name
                    ELSE ''
                END
            ) AS student_name,

            s.gender,

            se.session_id,

            ac.session_name,

            se.class_id,

            c.class_name,

            se.arm_id,

            a.arm_name,

            STRING_AGG(
                DISTINCT sub.subject_name,
                ', '
                ORDER BY sub.subject_name
            ) AS subjects

        FROM teacher_assignments ta

        JOIN student_enrollments se
            ON se.session_id = ta.session_id
            AND se.class_id = ta.class_id
            AND (
                ta.arm_id IS NULL
                OR se.arm_id = ta.arm_id
            )

        JOIN students s
            ON s.id = se.student_id

        JOIN classes c
            ON c.id = se.class_id

        LEFT JOIN arms a
            ON a.id = se.arm_id

        JOIN academic_sessions ac
            ON ac.id = se.session_id

        JOIN subjects sub
            ON sub.id = ta.subject_id

        WHERE ta.teacher_id = $1

        AND se.enrollment_status = 'Active'

        GROUP BY

            s.id,
            s.admission_number,
            s.surname,
            s.first_name,
            s.middle_name,
            s.gender,
            se.session_id,
            ac.session_name,
            se.class_id,
            c.class_name,
            se.arm_id,
            a.arm_name

        ORDER BY

            ac.session_name DESC,
            c.class_name,
            a.arm_name,
            s.surname,
            s.first_name;

    `;

    const result = await pool.query(
        query,
        [teacherId]
    );

    return result.rows;

};

module.exports = {

    createAssignment,
    getAssignmentById,
    getAssignmentsByTeacher,
    getAssignmentDetails,
    assignmentExists,
    deleteAssignment,
    findDuplicateAssignment,
    updateAssignment,
    getAllAssignments,
    getAssignmentForAttendance,
    getStudentsByTeacher

};