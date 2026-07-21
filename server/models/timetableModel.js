const pool = require("../config/database");

const hasTeacherConflict = async (
    teacherId,
    day,
    startTime,
    endTime
) => {

    const query = `
        SELECT 1

        FROM timetables tt

        JOIN teacher_assignments ta
            ON ta.id = tt.teacher_assignment_id

        WHERE
            ta.teacher_id = $1

            AND tt.day_of_week = $2

            AND NOT (

                tt.end_time <= $3

                OR

                tt.start_time >= $4

            )

        LIMIT 1;
    `;

    const result = await pool.query(query, [

        teacherId,
        day,
        startTime,
        endTime

    ]);

    return result.rowCount > 0;

};

const createTimetable = async (data) => {

    const query = `
        INSERT INTO timetables (
            teacher_assignment_id,
            day_of_week,
            start_time,
            end_time,
            room
        )
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *;
    `;

    const values = [
        data.teacher_assignment_id,
        data.day_of_week,
        data.start_time,
        data.end_time,
        data.room || null
    ];

    const result = await pool.query(query, values);

    return result.rows[0];

};

const hasClassConflict = async (

    classId,

    armId,

    day,

    startTime,

    endTime

) => {

    const query = `
        SELECT 1

        FROM timetables tt

        JOIN teacher_assignments ta
            ON ta.id = tt.teacher_assignment_id

        WHERE

            ta.class_id = $1

            AND (
                ta.arm_id = $2

                OR

                (
                    ta.arm_id IS NULL

                    AND

                    $2 IS NULL
                )
            )

            AND tt.day_of_week = $3

            AND NOT (

                tt.end_time <= $4

                OR

                tt.start_time >= $5

            )

        LIMIT 1;
    `;

    const result = await pool.query(query, [

        classId,

        armId,

        day,

        startTime,

        endTime

    ]);

    return result.rowCount > 0;

};

const getTimetableById = async (id) => {

    const query = `
        SELECT

            tt.id,

            tt.day_of_week,

            tt.start_time,

            tt.end_time,

            tt.room,

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

        FROM timetables tt

        JOIN teacher_assignments ta
            ON ta.id = tt.teacher_assignment_id

        JOIN teachers t
            ON t.id = ta.teacher_id

        JOIN subjects s
            ON s.id = ta.subject_id

        JOIN classes c
            ON c.id = ta.class_id

        LEFT JOIN arms a
            ON a.id = ta.arm_id

        JOIN terms tr
            ON tr.id = ta.term_id

        JOIN academic_sessions ac
            ON ac.id = ta.session_id

        WHERE tt.id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];

};

module.exports = {

    createTimetable,

    hasTeacherConflict,

    hasClassConflict,

    getTimetableById

};