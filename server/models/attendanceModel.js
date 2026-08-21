const pool = require("../config/database");


/*
=========================================
UPSERT ATTENDANCE
=========================================

If attendance for this student/date already
exists → UPDATE it.

If it does not exist → INSERT it.

This preserves all existing attendance data.
=========================================
*/

const upsertAttendance = async (
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

        VALUES (

            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8

        )

        ON CONFLICT (
            student_id,
            attendance_date
        )

        DO UPDATE SET

            session_id =
                EXCLUDED.session_id,

            term_id =
                EXCLUDED.term_id,

            class_id =
                EXCLUDED.class_id,

            arm_id =
                EXCLUDED.arm_id,

            status =
                EXCLUDED.status,

            marked_by =
                EXCLUDED.marked_by,

            updated_at =
                CURRENT_TIMESTAMP

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
        await client.query(
            query,
            values
        );


    return result.rows[0];

};


/*
=========================================
GET ATTENDANCE BY DATE
=========================================
*/

const getAttendanceByDate = async ({

    sessionId,
    termId,
    classId,
    armId,
    attendanceDate

}) => {

    const query = `

        SELECT *

        FROM attendance

        WHERE

            session_id = $1

            AND term_id = $2

            AND class_id = $3

            AND attendance_date = $4

            AND (

                arm_id = $5

                OR (

                    arm_id IS NULL
                    AND $5 IS NULL

                )

            )

        ORDER BY student_id;

    `;

    const result =
        await pool.query(

            query,

            [
                sessionId,
                termId,
                classId,
                attendanceDate,
                armId
            ]

        );

    return result.rows;

};


/*
=========================================
GET STUDENT ATTENDANCE
=========================================
*/

const getStudentAttendance = async ({
    studentId,
    sessionId,
    termId
}) => {

    const query = `

        SELECT

            attendance.*,

            academic_sessions.session_name,

            terms.term_name

        FROM attendance

        JOIN academic_sessions
            ON attendance.session_id =
               academic_sessions.id

        JOIN terms
            ON attendance.term_id =
               terms.id

        WHERE

            attendance.student_id = $1

            AND attendance.session_id = $2

            AND attendance.term_id = $3

        ORDER BY
            attendance.attendance_date DESC;

    `;


    const result =
        await pool.query(

            query,

            [
                studentId,
                sessionId,
                termId
            ]

        );


    return result.rows;

};


/*
=========================================
GET ATTENDANCE SUMMARY
=========================================
*/

const getAttendanceSummary = async ({
    studentId,
    sessionId,
    termId
}) => {

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

            ) AS late_days,


            SUM(

                CASE

                    WHEN status = 'EXCUSED'

                    THEN 1

                    ELSE 0

                END

            ) AS excused_days


        FROM attendance

        WHERE

            student_id = $1

            AND session_id = $2

            AND term_id = $3;

    `;


    const result =
        await pool.query(

            query,

            [
                studentId,
                sessionId,
                termId
            ]

        );


    return result.rows[0];

};


module.exports = {

    upsertAttendance,

    getAttendanceByDate,

    getStudentAttendance,

    getAttendanceSummary

};