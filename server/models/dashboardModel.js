const pool = require("../config/database");

const getStudentCount = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM students;

    `;

    const result =
        await pool.query(query);

    return Number(result.rows[0].total);

};

const getTeacherCount = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM teachers;

    `;

    const result =
        await pool.query(query);

    return Number(result.rows[0].total);

};

const getClassCount = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM classes;

    `;

    const result =
        await pool.query(query);

    return Number(result.rows[0].total);

};

const getCurrentSession = async () => {

    const query = `

        SELECT session_name

        FROM academic_sessions

        WHERE is_current = TRUE

        LIMIT 1;

    `;

    const result =
        await pool.query(query);

    return result.rows[0] || null;

};

const getCurrentTerm = async () => {

    const query = `

        SELECT term_name

        FROM terms

        WHERE is_current = TRUE

        LIMIT 1;

    `;

    const result =
        await pool.query(query);

    return result.rows[0] || null;

};

const getGenderDistribution = async () => {

    const query = `

        SELECT

            gender,

            COUNT(*) AS total

        FROM students

        GROUP BY gender

        ORDER BY gender;

    `;

    const result = await pool.query(query);

    return result.rows;

};

const getClassPopulation = async () => {

    const query = `

        SELECT

            c.class_name,

            COUNT(s.id) AS total_students

        FROM classes c

        LEFT JOIN students s

            ON s.class_id = c.id

        GROUP BY

            c.id,

            c.class_name

        ORDER BY c.class_name;

    `;

    const result = await pool.query(query);

    return result.rows;

};

const getRecentStudents = async (limit = 5) => {

    const query = `

        SELECT

            id,

            surname,

            first_name,

            admission_number,

            created_at

        FROM students

        ORDER BY created_at DESC

        LIMIT $1;

    `;

    const result = await pool.query(query, [limit]);

    return result.rows;

};

const getTodayAttendance = async () => {

    const query = `

        SELECT

            COUNT(*) AS total,

            SUM(

                CASE

                    WHEN status = 'PRESENT'

                    THEN 1

                    ELSE 0

                END

            ) AS present

        FROM attendance

        WHERE attendance_date = CURRENT_DATE;

    `;

    const result = await pool.query(query);

    return result.rows[0];

};

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

    const result = await pool.query(query,[limit]);

    return result.rows;

};

module.exports = {
    getStudentCount,
    getTeacherCount,
    getClassCount,
    getCurrentSession,
    getCurrentTerm,
    getGenderDistribution,
    getClassPopulation,
    getRecentStudents,
    getTodayAttendance,
    getTopStudents
}