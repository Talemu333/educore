const pool = require("../config/database");

const getStudentAccount = async (studentId, schoolId, client = pool) => {
    const result = await client.query(`
        SELECT u.id, u.username, u.email, u.is_active, u.must_change_password,
               u.student_id, r.role_name
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        WHERE u.student_id = $1
          AND u.school_id = $2
        LIMIT 1;
    `, [studentId, schoolId]);

    return result.rows[0];
};

const getStudent = async (studentId, schoolId, client = pool) => {
    const result = await client.query(`
        SELECT id, school_id, admission_number, surname, first_name, middle_name,
               class_id, arm_id, status
        FROM students
        WHERE id = $1 AND school_id = $2
        LIMIT 1;
    `, [studentId, schoolId]);

    return result.rows[0];
};

const usernameExists = async (username, schoolId, client = pool) => {
    const result = await client.query(`
        SELECT 1
        FROM users
        WHERE LOWER(username) = LOWER($1)
          AND school_id = $2
        LIMIT 1;
    `, [username, schoolId]);

    return result.rowCount > 0;
};

const getStudentRoleId = async (client = pool) => {
    const result = await client.query(`
        SELECT id
        FROM roles
        WHERE LOWER(role_name) = 'student'
        LIMIT 1;
    `);

    return result.rows[0]?.id;
};

const createStudentAccount = async ({
    studentId,
    schoolId,
    username,
    passwordHash,
    roleId
}, client = pool) => {
    const result = await client.query(`
        INSERT INTO users
        (
            username,
            email,
            password,
            role_id,
            school_id,
            student_id,
            is_active,
            must_change_password,
            created_at,
            updated_at
        )
        VALUES ($1, NULL, $2, $3, $4, $5, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, username, school_id, student_id, is_active, must_change_password;
    `, [username, passwordHash, roleId, schoolId, studentId]);

    return result.rows[0];
};

module.exports = {
    getStudentAccount,
    getStudent,
    usernameExists,
    getStudentRoleId,
    createStudentAccount
};
