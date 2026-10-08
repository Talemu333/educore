const pool = require("../config/database");

const getStudentAccount = async (studentId, schoolId, client = pool) => {
    const result = await client.query(
        `SELECT u.id, u.username, u.email, u.is_active, u.must_change_password,
                s.id AS student_id, r.role_name
         FROM students s
         INNER JOIN users u
            ON u.school_id = s.school_id
           AND (u.student_id = s.id OR s.user_id = u.id)
         INNER JOIN roles r ON r.id = u.role_id
         WHERE s.id = $1
           AND s.school_id = $2
         ORDER BY CASE WHEN u.student_id = s.id THEN 0 ELSE 1 END
         LIMIT 1;`,
        [studentId, schoolId]
    );
    return result.rows[0];
};

const getStudent = async (studentId, schoolId, client = pool) => {
    const result = await client.query(
        `SELECT id, school_id, admission_number, surname, first_name, middle_name,
                class_id, arm_id, status
         FROM students
         WHERE id = $1 AND school_id = $2
         LIMIT 1;`,
        [studentId, schoolId]
    );
    return result.rows[0];
};

const usernameExists = async (username, schoolId, client = pool) => {
    const result = await client.query(
        `SELECT 1
         FROM users
         WHERE LOWER(username) = LOWER($1)
           AND school_id = $2
         LIMIT 1;`,
        [username, schoolId]
    );
    return result.rowCount > 0;
};

const getStudentRoleId = async (client = pool) => {
    const result = await client.query(
        `SELECT id
         FROM roles
         WHERE LOWER(role_name) = 'student'
         LIMIT 1;`
    );
    return result.rows[0]?.id;
};

const createStudentAccount = async ({
    studentId,
    schoolId,
    username,
    passwordHash,
    roleId
}, client = pool) => {
    const result = await client.query(
        `INSERT INTO users
            (username, email, password, role_id, school_id, student_id,
             is_active, must_change_password, created_at, updated_at)
         VALUES ($1, NULL, $2, $3, $4, $5, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, username, school_id, student_id, is_active, must_change_password;`,
        [username, passwordHash, roleId, schoolId, studentId]
    );

    // Keep the original students.user_id relationship synchronized when the
    // dedicated database still contains that legacy/current column.
    await client.query(
        `UPDATE students
         SET user_id = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
           AND school_id = $3
           AND (user_id IS NULL OR user_id = $1);`,
        [result.rows[0].id, studentId, schoolId]
    );

    return result.rows[0];
};

module.exports = {
    getStudentAccount,
    getStudent,
    usernameExists,
    getStudentRoleId,
    createStudentAccount
};
