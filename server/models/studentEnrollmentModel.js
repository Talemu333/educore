const pool = require("../config/database");
const enrollmentExists = async (

    studentId,

    sessionId

) => {

    const query = `

        SELECT 1

        FROM student_enrollments

        WHERE

            student_id = $1

            AND

            session_id = $2

        LIMIT 1;

    `;

    const result = await pool.query(

        query,

        [

            studentId,

            sessionId

        ]

    );

    return result.rowCount > 0;

};

const createEnrollment = async (
    data,
    client = pool
) => {

    const query = `

        INSERT INTO student_enrollments(

            student_id,

            session_id,

            class_id,

            arm_id,

            enrollment_date,

            enrollment_status

        )

        VALUES($1,$2,$3,$4,$5,$6)

        RETURNING *;

    `;

    const values = [

        data.student_id,

        data.session_id,

        data.class_id,

        data.arm_id,

        data.enrollment_date,

        data.enrollment_status

    ];

    const result =
        await client.query(query, values);

    return result.rows[0];

};

const getStudentsForAssignment = async (assignmentId) => {

    const query = `
        SELECT

            s.id,

            s.admission_number,

            CONCAT(
                s.surname,
                ' ',
                s.first_name,
                ' ',
                COALESCE(s.middle_name, '')
            ) AS student_name,

            ta.session_id,

            ta.term_id,

            se.class_id,

            se.arm_id

        FROM teacher_assignments ta

        JOIN student_enrollments se
            ON se.class_id = ta.class_id

        JOIN students s
            ON s.id = se.student_id

        WHERE

            ta.id = $1

            AND

            (

                ta.arm_id IS NULL

                OR

                ta.arm_id = se.arm_id

            )

            AND

            se.session_id = ta.session_id

            AND

            se.enrollment_status = 'Active'

        ORDER BY

            s.surname,

            s.first_name;

    `;

    const result = await pool.query(

        query,

        [assignmentId]

    );

    return result.rows;

};

const getStudentsByEnrollment = async (
    sessionId,
    classId,
    armId
) => {

    const query = `

        SELECT

            s.id,

            s.admission_number,

            s.surname,

            s.first_name,

            s.middle_name,

            CONCAT(

                s.surname,

                ' ',

                s.first_name,

                CASE

                    WHEN s.middle_name IS NOT NULL

                        AND s.middle_name <> ''

                    THEN CONCAT(
                        ' ',
                        s.middle_name
                    )

                    ELSE ''

                END

            ) AS student_name,

            se.class_id,

            se.arm_id,

            se.session_id

        FROM student_enrollments se

        JOIN students s

            ON s.id = se.student_id

        WHERE

            se.session_id = $1

            AND se.class_id = $2

            AND (

                $3::integer IS NULL

                OR se.arm_id = $3

            )

            AND se.enrollment_status = 'Active'

        ORDER BY

            s.surname,

            s.first_name;

    `;

    const result = await pool.query(

        query,

        [

            sessionId,

            classId,

            armId || null

        ]

    );

    return result.rows;

};

const getStudentsForAttendance = async ({
    sessionId,
    classId,
    armId
}) => {

    const query = `

        SELECT

            s.id,

            s.admission_number,

            CONCAT(
                s.surname,
                ' ',
                s.first_name,
                ' ',
                COALESCE(s.middle_name, '')
            ) AS student_name,

            se.session_id,

            se.class_id,

            se.arm_id

        FROM student_enrollments se

        JOIN students s
            ON s.id = se.student_id

        WHERE

            se.session_id = $1

            AND se.class_id = $2

            AND (

                se.arm_id = $3

                OR (

                    se.arm_id IS NULL

                    AND $3 IS NULL

                )

            )

            AND se.enrollment_status = 'Active'

        ORDER BY

            s.surname,

            s.first_name;

    `;


    const result =
        await pool.query(

            query,

            [
                sessionId,
                classId,
                armId
            ]

        );


    return result.rows;

};

module.exports = {
    enrollmentExists,
    createEnrollment,
    getStudentsForAssignment,
    getStudentsByEnrollment,
    getStudentsForAttendance
}