const pool = require("../config/database");

const createAttendance = async (
    data,
    client = pool
) => {

    const query = `

        INSERT INTO attendance (

            student_id,

            session_id,

            term_id,

            class_id,

            arm_id,

            attendance_date,

            status,

            marked_by

        )

        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)

        RETURNING *;

    `;

    const values = [

        data.student_id,

        data.session_id,

        data.term_id,

        data.class_id,

        data.arm_id,

        data.attendance_date,

        data.status,

        data.marked_by

    ];

    const result =
        await client.query(query, values);

    return result.rows[0];

};

const attendanceExists = async (

    studentId,

    attendanceDate

) => {

    const query = `

        SELECT 1

        FROM attendance

        WHERE

            student_id = $1

            AND

            attendance_date = $2

        LIMIT 1;

    `;

    const result = await pool.query(

        query,

        [

            studentId,

            attendanceDate

        ]

    );

    return result.rowCount > 0;

};

const getAttendanceByDate = async (

    classId,

    armId,

    attendanceDate

) => {

    const query = `

        SELECT *

        FROM attendance

        WHERE

            class_id = $1

            AND

            attendance_date = $2

            AND (

                arm_id = $3

                OR (

                    arm_id IS NULL

                    AND

                    $3 IS NULL

                )

            )

        ORDER BY student_id;

    `;

    const result = await pool.query(

        query,

        [

            classId,

            attendanceDate,

            armId

        ]

    );

    return result.rows;

};

const getStudentAttendance = async (

    studentId

) => {

    const query = `

        SELECT *

        FROM attendance

        WHERE

            student_id = $1

        ORDER BY attendance_date DESC;

    `;

    const result = await pool.query(

        query,

        [

            studentId

        ]

    );

    return result.rows;

};

const updateAttendance = async (

    attendanceId,

    status,

    client = pool

) => {

    const query = `

        UPDATE attendance

        SET

            status = $2,

            updated_at = CURRENT_TIMESTAMP

        WHERE

            id = $1

        RETURNING *;

    `;

    const result = await client.query(

        query,

        [

            attendanceId,

            status

        ]

    );

    return result.rows[0];

};

const getAttendanceSummary =
async (studentId) => {

    const query = `

        SELECT

            COUNT(*) AS total_days,

            SUM(

                CASE

                    WHEN status = 'PRESENT'

                    THEN 1

                    ELSE 0

                END

            ) AS present_days,

            SUM(

                CASE

                    WHEN status = 'ABSENT'

                    THEN 1

                    ELSE 0

                END

            ) AS absent_days,

            SUM(

                CASE

                    WHEN status = 'LATE'

                    THEN 1

                    ELSE 0

                END

            ) AS late_days

        FROM attendance

        WHERE

            student_id = $1;

    `;

    const result =
        await pool.query(query,[studentId]);

    return result.rows[0];

};

module.exports = {
    createAttendance,
    attendanceExists,
    getAttendanceByDate,
    getStudentAttendance,
    updateAttendance,
    getAttendanceSummary
};