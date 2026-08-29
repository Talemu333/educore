const pool = require("../config/database");

const getStudentCount = async (schoolId) => {
    const result = await pool.query(`SELECT COUNT(*) AS total FROM students WHERE school_id = $1`, [schoolId]);
    return Number(result.rows[0].total);
};

const getActiveStudentCount = async (schoolId) => {
    const result = await pool.query(`
        SELECT COUNT(DISTINCT se.student_id) AS total
        FROM student_enrollments se
        JOIN students s ON s.id = se.student_id
        WHERE se.enrollment_status = 'Active' AND s.school_id = $1
    `, [schoolId]);
    return Number(result.rows[0].total);
};

const getTeacherCount = async (schoolId) => {
    const result = await pool.query(`SELECT COUNT(*) AS total FROM teachers WHERE school_id = $1`, [schoolId]);
    return Number(result.rows[0].total);
};

const getParentCount = async (schoolId) => {
    const result = await pool.query(`SELECT COUNT(*) AS total FROM parents WHERE school_id = $1`, [schoolId]);
    return Number(result.rows[0].total);
};

const getClassCount = async (schoolId) => {
    const result = await pool.query(`SELECT COUNT(*) AS total FROM classes WHERE school_id = $1`, [schoolId]);
    return Number(result.rows[0].total);
};

const getCurrentSession = async (schoolId) => {
    const result = await pool.query(`
        SELECT id, session_name
        FROM academic_sessions
        WHERE is_current = TRUE AND school_id = $1
        ORDER BY id DESC LIMIT 1
    `, [schoolId]);
    return result.rows[0] || null;
};

const getCurrentTerm = async (schoolId) => {
    const result = await pool.query(`
        SELECT id, term_name
        FROM terms
        WHERE is_current = TRUE AND school_id = $1
        ORDER BY id DESC LIMIT 1
    `, [schoolId]);
    return result.rows[0] || null;
};

const getGenderDistribution = async (schoolId) => {
    const result = await pool.query(`
        SELECT gender, COUNT(*) AS total
        FROM students
        WHERE school_id = $1
        GROUP BY gender ORDER BY gender
    `, [schoolId]);
    return result.rows;
};

const getClassPopulation = async (schoolId) => {
    const result = await pool.query(`
        SELECT c.class_name, COUNT(se.student_id) AS total_students
        FROM classes c
        LEFT JOIN student_enrollments se
          ON se.class_id = c.id AND se.enrollment_status = 'Active'
        WHERE c.school_id = $1
        GROUP BY c.id, c.class_name
        ORDER BY c.class_name
    `, [schoolId]);
    return result.rows;
};

const getRecentStudents = async (schoolId, limit = 5) => {
    const result = await pool.query(`
        SELECT id, surname, first_name, middle_name, admission_number, created_at
        FROM students WHERE school_id = $1
        ORDER BY created_at DESC LIMIT $2
    `, [schoolId, limit]);
    return result.rows;
};

const getTodayAttendance = async (schoolId) => {
    const result = await pool.query(`
        SELECT COUNT(*) AS total,
               COUNT(*) FILTER (WHERE a.status = 'PRESENT') AS present,
               COUNT(*) FILTER (WHERE a.status = 'ABSENT') AS absent,
               COUNT(*) FILTER (WHERE a.status = 'LATE') AS late
        FROM attendance a
        JOIN students s ON s.id = a.student_id
        WHERE a.attendance_date = CURRENT_DATE AND s.school_id = $1
    `, [schoolId]);
    return result.rows[0];
};

const getTopStudents = async (schoolId, limit = 10) => {
    const result = await pool.query(`
        SELECT s.id, s.surname, s.first_name, AVG(r.total_score) AS average_score
        FROM students s
        JOIN student_results r ON r.student_id = s.id
        WHERE s.school_id = $1
        GROUP BY s.id, s.surname, s.first_name
        ORDER BY average_score DESC LIMIT $2
    `, [schoolId, limit]);
    return result.rows;
};

const getExpectedFees = async (schoolId, sessionId, termId) => {
    if (!schoolId || !sessionId || !termId) return 0;
    const result = await pool.query(`
        SELECT COALESCE(SUM(fs.amount), 0) AS total
        FROM student_enrollments se
        JOIN students s ON s.id = se.student_id
        JOIN fee_structures fs
          ON fs.session_id = se.session_id
         AND fs.term_id = $3
         AND fs.class_id = se.class_id
        WHERE se.session_id = $2
          AND se.enrollment_status = 'Active'
          AND s.school_id = $1
    `, [schoolId, sessionId, termId]);
    return Number(result.rows[0].total);
};

const getTotalPayments = async (schoolId, sessionId, termId) => {
    if (!schoolId || !sessionId || !termId) return 0;
    const result = await pool.query(`
        SELECT COALESCE(SUM(sp.amount_paid), 0) AS total
        FROM student_payments sp
        JOIN students s ON s.id = sp.student_id
        WHERE sp.session_id = $2 AND sp.term_id = $3 AND s.school_id = $1
    `, [schoolId, sessionId, termId]);
    return Number(result.rows[0].total);
};

const getStudentsWithPayments = async (schoolId, sessionId, termId) => {
    if (!schoolId || !sessionId || !termId) return 0;
    const result = await pool.query(`
        SELECT COUNT(DISTINCT sp.student_id) AS total
        FROM student_payments sp
        JOIN students s ON s.id = sp.student_id
        WHERE sp.session_id = $2 AND sp.term_id = $3 AND s.school_id = $1
    `, [schoolId, sessionId, termId]);
    return Number(result.rows[0].total);
};

const getRecentPayments = async (schoolId, limit = 5) => {
    const result = await pool.query(`
        SELECT sp.id, sp.payment_date, sp.amount_paid, sp.payment_method,
               sp.reference_number, sp.remarks,
               CONCAT(s.surname, ' ', s.first_name) AS student_name
        FROM student_payments sp
        JOIN students s ON s.id = sp.student_id
        WHERE s.school_id = $1
        ORDER BY sp.payment_date DESC, sp.id DESC LIMIT $2
    `, [schoolId, limit]);
    return result.rows;
};

const getRecentAnnouncements = async (schoolId, limit = 5) => {
    const result = await pool.query(`
        SELECT * FROM announcements
        WHERE school_id = $1
        ORDER BY created_at DESC LIMIT $2
    `, [schoolId, limit]);
    return result.rows;
};

module.exports = {
    getStudentCount, getActiveStudentCount, getTeacherCount, getParentCount,
    getClassCount, getCurrentSession, getCurrentTerm, getGenderDistribution,
    getClassPopulation, getRecentStudents, getTodayAttendance, getTopStudents,
    getExpectedFees, getTotalPayments, getStudentsWithPayments,
    getRecentPayments, getRecentAnnouncements
};
