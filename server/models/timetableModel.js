const pool = require("../config/database");

const hasTeacherConflict = async (teacherId, day, startTime, endTime, schoolId, sessionId, termId, excludeId = null) => {
    const result = await pool.query(`
        SELECT 1
        FROM timetables tt
        JOIN teacher_assignments ta ON ta.id = tt.teacher_assignment_id
        JOIN teachers t ON t.id = ta.teacher_id
        JOIN users u ON u.id = t.user_id
        WHERE ta.teacher_id = $1
          AND u.school_id = $5
          AND tt.school_id = $5
          AND ta.session_id = $6
          AND ta.term_id = $7
          AND tt.day_of_week = $2
          AND NOT (tt.end_time <= $3 OR tt.start_time >= $4)
          AND ($8::integer IS NULL OR tt.id <> $8)
        LIMIT 1;
    `, [teacherId, day, startTime, endTime, schoolId, sessionId, termId, excludeId]);
    return result.rowCount > 0;
};

const createTimetable = async (data, schoolId) => {
    const result = await pool.query(`
        INSERT INTO timetables
            (teacher_assignment_id, day_of_week, start_time, end_time, room, school_id)
        SELECT $1, $2, $3, $4, $5, $6
        WHERE EXISTS (
            SELECT 1
            FROM teacher_assignments ta
            JOIN teachers t ON t.id = ta.teacher_id
            JOIN users u ON u.id = t.user_id
            WHERE ta.id = $1 AND u.school_id = $6
        )
        RETURNING *;
    `, [data.teacher_assignment_id, data.day_of_week, data.start_time, data.end_time, data.room || null, schoolId]);
    return result.rows[0];
};

const hasClassConflict = async (classId, armId, day, startTime, endTime, schoolId, sessionId, termId, excludeId = null) => {
    const result = await pool.query(`
        SELECT 1
        FROM timetables tt
        JOIN teacher_assignments ta ON ta.id = tt.teacher_assignment_id
        JOIN classes c ON c.id = ta.class_id
        WHERE ta.class_id = $1
          AND c.school_id = $6
          AND tt.school_id = $6
          AND ($2 IS NULL OR ta.arm_id IS NULL OR ta.arm_id = $2)
          AND ta.session_id = $7
          AND ta.term_id = $8
          AND tt.day_of_week = $3
          AND NOT (tt.end_time <= $4 OR tt.start_time >= $5)
          AND ($9::integer IS NULL OR tt.id <> $9)
        LIMIT 1;
    `, [classId, armId, day, startTime, endTime, schoolId, sessionId, termId, excludeId]);
    return result.rowCount > 0;
};

const timetableSelect = `
    SELECT tt.id, tt.teacher_assignment_id, tt.school_id, tt.day_of_week,
           to_char(tt.start_time, 'HH24:MI') AS start_time,
           to_char(tt.end_time, 'HH24:MI') AS end_time,
           tt.room, ta.teacher_id, ta.subject_id, ta.class_id, ta.arm_id,
           ta.session_id, ta.term_id,
           CONCAT(t.surname, ' ', t.first_name) AS teacher_name,
           s.subject_name, c.class_name, a.arm_name, tr.term_name, ac.session_name
    FROM timetables tt
    JOIN teacher_assignments ta ON ta.id = tt.teacher_assignment_id
    JOIN teachers t ON t.id = ta.teacher_id
    JOIN users u ON u.id = t.user_id
    JOIN subjects s ON s.id = ta.subject_id
    JOIN classes c ON c.id = ta.class_id
    LEFT JOIN arms a ON a.id = ta.arm_id
    JOIN terms tr ON tr.id = ta.term_id
    JOIN academic_sessions ac ON ac.id = ta.session_id
`;

const getTimetables = async (schoolId) => {
    const result = await pool.query(`
        ${timetableSelect}
        WHERE tt.school_id = $1 AND u.school_id = $1
        ORDER BY CASE tt.day_of_week
            WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
            WHEN 'Sunday' THEN 7 ELSE 8 END,
            tt.start_time, c.class_name, s.subject_name;
    `, [schoolId]);
    return result.rows;
};

const getTimetableById = async (id, schoolId) => {
    const result = await pool.query(`
        ${timetableSelect}
        WHERE tt.id = $1 AND tt.school_id = $2 AND u.school_id = $2;
    `, [id, schoolId]);
    return result.rows[0];
};

const updateTimetable = async (id, data, schoolId) => {
    const result = await pool.query(`
        UPDATE timetables tt
        SET teacher_assignment_id = $1,
            day_of_week = $2,
            start_time = $3,
            end_time = $4,
            room = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE tt.id = $6 AND tt.school_id = $7
          AND EXISTS (
              SELECT 1 FROM teacher_assignments ta
              JOIN teachers t ON t.id = ta.teacher_id
              JOIN users u ON u.id = t.user_id
              WHERE ta.id = $1 AND u.school_id = $7
          )
        RETURNING tt.id;
    `, [data.teacher_assignment_id, data.day_of_week, data.start_time, data.end_time, data.room || null, id, schoolId]);
    return result.rows[0];
};

const deleteTimetable = async (id, schoolId) => {
    const result = await pool.query(
        "DELETE FROM timetables WHERE id = $1 AND school_id = $2 RETURNING id",
        [id, schoolId]
    );
    return result.rows[0];
};

module.exports = {
    createTimetable,
    getTimetables,
    getTimetableById,
    updateTimetable,
    deleteTimetable,
    hasTeacherConflict,
    hasClassConflict
};
