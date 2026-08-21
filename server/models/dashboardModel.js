const pool = require("../config/database");


// ======================================================
// STUDENTS
// ======================================================

const getStudentCount = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM students;

    `;

    const result =
        await pool.query(query);

    return Number(result.rows[0].total);

};


// ======================================================
// ACTIVE STUDENTS
// ======================================================

const getActiveStudentCount = async () => {

    const query = `

        SELECT COUNT(DISTINCT student_id) AS total

        FROM student_enrollments

        WHERE enrollment_status = 'Active';

    `;

    const result =
        await pool.query(query);

    return Number(result.rows[0].total);

};


// ======================================================
// TEACHERS
// ======================================================

const getTeacherCount = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM teachers;

    `;

    const result =
        await pool.query(query);

    return Number(result.rows[0].total);

};


// ======================================================
// PARENTS
// ======================================================

const getParentCount = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM parents;

    `;

    const result =
        await pool.query(query);

    return Number(result.rows[0].total);

};


// ======================================================
// CLASSES
// ======================================================

const getClassCount = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM classes;

    `;

    const result =
        await pool.query(query);

    return Number(result.rows[0].total);

};


// ======================================================
// CURRENT SESSION
// ======================================================

const getCurrentSession = async () => {

    const query = `

        SELECT
            id,
            session_name

        FROM academic_sessions

        WHERE is_current = TRUE

        LIMIT 1;

    `;

    const result =
        await pool.query(query);

    return result.rows[0] || null;

};


// ======================================================
// CURRENT TERM
// ======================================================

const getCurrentTerm = async () => {

    const query = `

        SELECT
            id,
            term_name

        FROM terms

        WHERE is_current = TRUE

        LIMIT 1;

    `;

    const result =
        await pool.query(query);

    return result.rows[0] || null;

};


// ======================================================
// GENDER DISTRIBUTION
// ======================================================

const getGenderDistribution = async () => {

    const query = `

        SELECT

            gender,

            COUNT(*) AS total

        FROM students

        GROUP BY gender

        ORDER BY gender;

    `;

    const result =
        await pool.query(query);

    return result.rows;

};


// ======================================================
// CLASS POPULATION
// ======================================================

const getClassPopulation = async () => {

    const query = `

        SELECT

            c.class_name,

            COUNT(se.student_id) AS total_students

        FROM classes c

        LEFT JOIN student_enrollments se
            ON se.class_id = c.id
            AND se.enrollment_status = 'Active'

        GROUP BY
            c.id,
            c.class_name

        ORDER BY c.class_name;

    `;

    const result =
        await pool.query(query);

    return result.rows;

};


// ======================================================
// RECENT STUDENTS
// ======================================================

const getRecentStudents = async (limit = 5) => {

    const query = `

        SELECT

            id,
            surname,
            first_name,
            middle_name,
            admission_number,
            created_at

        FROM students

        ORDER BY created_at DESC

        LIMIT $1;

    `;

    const result =
        await pool.query(query, [limit]);

    return result.rows;

};


// ======================================================
// TODAY'S ATTENDANCE
// ======================================================

const getTodayAttendance = async () => {

    const query = `

        SELECT

            COUNT(*) AS total,

            COUNT(*) FILTER (
                WHERE status = 'PRESENT'
            ) AS present,

            COUNT(*) FILTER (
                WHERE status = 'ABSENT'
            ) AS absent,

            COUNT(*) FILTER (
                WHERE status = 'LATE'
            ) AS late

        FROM attendance

        WHERE attendance_date = CURRENT_DATE;

    `;

    const result =
        await pool.query(query);

    return result.rows[0];

};


// ======================================================
// TOP STUDENTS
// ======================================================

const getTopStudents = async (limit = 10) => {

    const query = `

        SELECT

            s.id,

            s.surname,

            s.first_name,

            AVG(r.total_score) AS average_score

        FROM students s

        JOIN student_results r
            ON r.student_id = s.id

        GROUP BY

            s.id,
            s.surname,
            s.first_name

        ORDER BY average_score DESC

        LIMIT $1;

    `;

    const result =
        await pool.query(
            query,
            [limit]
        );

    return result.rows;

};


// ======================================================
// FINANCE - EXPECTED FEES
// ======================================================

const getExpectedFees = async (
    sessionId,
    termId
) => {

    if (!sessionId || !termId) {

        return 0;

    }


    const query = `

        SELECT

            COALESCE(
                SUM(fs.amount),
                0
            ) AS total

        FROM student_enrollments se

        JOIN fee_structures fs
            ON fs.session_id = se.session_id

            AND fs.term_id = $2

            AND fs.class_id = se.class_id

        WHERE

            se.session_id = $1

            AND se.enrollment_status = 'Active';

    `;

    const result =
        await pool.query(
            query,
            [
                sessionId,
                termId
            ]
        );

    return Number(
        result.rows[0].total
    );

};


// ======================================================
// FINANCE - TOTAL PAYMENTS
// ======================================================

const getTotalPayments = async (
    sessionId,
    termId
) => {

    if (!sessionId || !termId) {
        return 0;
    }

    const query = `

        SELECT
            COALESCE(
                SUM(sp.amount_paid),
                0
            ) AS total

        FROM student_payments sp

        WHERE
            sp.session_id = $1
            AND sp.term_id = $2;

    `;

    const result =
        await pool.query(
            query,
            [
                sessionId,
                termId
            ]
        );

    return Number(
        result.rows[0].total
    );

};


// ======================================================
// FINANCE - NUMBER OF STUDENTS WITH PAYMENTS
// ======================================================

const getStudentsWithPayments = async (
    sessionId,
    termId
) => {

    if (!sessionId || !termId) {
        return 0;
    }

    const query = `

        SELECT
            COUNT(DISTINCT student_id) AS total

        FROM student_payments

        WHERE
            session_id = $1
            AND term_id = $2;

    `;

    const result =
        await pool.query(
            query,
            [
                sessionId,
                termId
            ]
        );

    return Number(
        result.rows[0].total
    );

};


// ======================================================
// RECENT PAYMENTS
// ======================================================

const getRecentPayments = async (
    limit = 5
) => {

    const query = `

        SELECT

            sp.id,

            sp.payment_date,

            sp.amount_paid,

            sp.payment_method,

            sp.reference_number,

            sp.remarks,

            CONCAT(
                s.surname,
                ' ',
                s.first_name
            ) AS student_name

        FROM student_payments sp

        JOIN students s
            ON s.id = sp.student_id

        ORDER BY
            sp.payment_date DESC,
            sp.id DESC

        LIMIT $1;

    `;

    const result =
        await pool.query(
            query,
            [limit]
        );

    return result.rows;

};


// ======================================================
// RECENT ANNOUNCEMENTS
// ======================================================

const getRecentAnnouncements = async (
    limit = 5
) => {

    const query = `

        SELECT *

        FROM announcements

        ORDER BY created_at DESC

        LIMIT $1;

    `;

    const result =
        await pool.query(
            query,
            [limit]
        );

    return result.rows;

};


module.exports = {

    getStudentCount,

    getActiveStudentCount,

    getTeacherCount,

    getParentCount,

    getClassCount,

    getCurrentSession,

    getCurrentTerm,

    getGenderDistribution,

    getClassPopulation,

    getRecentStudents,

    getTodayAttendance,

    getTopStudents,

    getExpectedFees,

    getTotalPayments,

    getStudentsWithPayments,

    getRecentPayments,

    getRecentAnnouncements

};