const pool = require("../config/database");

const upsertAttendance = async (data, client = pool) => {
    const query = `
        INSERT INTO attendance (student_id, session_id, term_id, class_id, arm_id, attendance_date, status, marked_by)
        SELECT $1,$2,$3,$4,$5,$6,$7,$8
        WHERE EXISTS (
            SELECT 1 FROM students s JOIN users su ON su.id=s.user_id WHERE s.id=$1 AND su.school_id=$9
        ) AND EXISTS (
            SELECT 1 FROM users u WHERE u.id=$8 AND u.school_id=$9
        )
        ON CONFLICT (student_id, attendance_date)
        DO UPDATE SET session_id=EXCLUDED.session_id, term_id=EXCLUDED.term_id, class_id=EXCLUDED.class_id,
            arm_id=EXCLUDED.arm_id, status=EXCLUDED.status, marked_by=EXCLUDED.marked_by, updated_at=CURRENT_TIMESTAMP
        RETURNING *;
    `;
    const result = await client.query(query, [data.student_id,data.session_id,data.term_id,data.class_id,data.arm_id,data.attendance_date,data.status,data.marked_by,data.school_id]);
    return result.rows[0];
};

const getAttendanceByDate = async ({sessionId,termId,classId,armId,attendanceDate,schoolId}) => {
    const result = await pool.query(`
        SELECT a.* FROM attendance a
        JOIN students s ON s.id=a.student_id JOIN users u ON u.id=s.user_id
        WHERE a.session_id=$1 AND a.term_id=$2 AND a.class_id=$3 AND a.attendance_date=$4
          AND (a.arm_id=$5 OR (a.arm_id IS NULL AND $5 IS NULL)) AND u.school_id=$6
        ORDER BY a.student_id;
    `, [sessionId,termId,classId,attendanceDate,armId,schoolId]);
    return result.rows;
};

const getStudentAttendance = async ({studentId,sessionId,termId,schoolId}) => {
    const result = await pool.query(`
        SELECT a.*, academic_sessions.session_name, terms.term_name
        FROM attendance a
        JOIN students s ON s.id=a.student_id JOIN users u ON u.id=s.user_id
        JOIN academic_sessions ON a.session_id=academic_sessions.id JOIN terms ON a.term_id=terms.id
        WHERE a.student_id=$1 AND a.session_id=$2 AND a.term_id=$3 AND u.school_id=$4
        ORDER BY a.attendance_date DESC;
    `, [studentId,sessionId,termId,schoolId]);
    return result.rows;
};

const getAttendanceSummary = async ({studentId,sessionId,termId,schoolId}) => {
    const result = await pool.query(`
        SELECT COUNT(*) total_days,
            SUM(CASE WHEN a.status='PRESENT' THEN 1 ELSE 0 END) present_days,
            SUM(CASE WHEN a.status='ABSENT' THEN 1 ELSE 0 END) absent_days,
            SUM(CASE WHEN a.status='LATE' THEN 1 ELSE 0 END) late_days,
            SUM(CASE WHEN a.status='EXCUSED' THEN 1 ELSE 0 END) excused_days
        FROM attendance a JOIN students s ON s.id=a.student_id JOIN users u ON u.id=s.user_id
        WHERE a.student_id=$1 AND a.session_id=$2 AND a.term_id=$3 AND u.school_id=$4;
    `, [studentId,sessionId,termId,schoolId]);
    return result.rows[0];
};

module.exports={upsertAttendance,getAttendanceByDate,getStudentAttendance,getAttendanceSummary};