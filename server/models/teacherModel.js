const pool = require("../config/database");

const createTeacher = async (client, teacherData, schoolId) => {
    const result = await client.query(`
        INSERT INTO teachers (
            id, school_id, user_id, staff_number, surname, first_name, middle_name, gender,
            date_of_birth, phone_number, email, address, marital_status,
            qualification_id, department_id, employment_date, state_id,
            nationality_id, next_of_kin_name, next_of_kin_phone,
            emergency_contact_name, emergency_contact_phone
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
        RETURNING *;
    `, [teacherData.id, schoolId, teacherData.user_id, teacherData.staff_number, teacherData.surname,
        teacherData.first_name, teacherData.middle_name, teacherData.gender,
        teacherData.date_of_birth, teacherData.phone_number, teacherData.email,
        teacherData.address, teacherData.marital_status, teacherData.qualification_id,
        teacherData.department_id, teacherData.employment_date, teacherData.state_id,
        teacherData.nationality_id, teacherData.next_of_kin_name, teacherData.next_of_kin_phone,
        teacherData.emergency_contact_name, teacherData.emergency_contact_phone]);
    return result.rows[0];
};

const getNextTeacherId = async (client) => {
    const result = await client.query("SELECT nextval(pg_get_serial_sequence('teachers', 'id')) AS id");
    return result.rows[0].id;
};

const getTeachers = async (schoolId) => {
    const result = await pool.query(`
        SELECT t.id, t.department_id, t.qualification_id, t.staff_number,
               CONCAT(t.surname, ' ', t.first_name, ' ', COALESCE(t.middle_name,'')) AS full_name,
               d.department_name, q.qualification_name, t.phone_number, t.email, t.status
        FROM teachers t
        LEFT JOIN departments d ON d.id = t.department_id
        LEFT JOIN qualifications q ON q.id = t.qualification_id
        WHERE t.school_id = $1 AND t.status = 'Active'
        ORDER BY t.surname, t.first_name;
    `, [schoolId]);
    return result.rows;
};

const getTeacherById = async (id, schoolId) => {
    const result = await pool.query(`
        SELECT t.*, d.department_name, q.qualification_name, s.state_name,
               n.nationality_name, u.username, u.school_id
        FROM teachers t
        INNER JOIN users u ON u.id = t.user_id
        LEFT JOIN departments d ON d.id = t.department_id
        LEFT JOIN qualifications q ON q.id = t.qualification_id
        LEFT JOIN states s ON s.id = t.state_id
        LEFT JOIN nationalities n ON n.id = t.nationality_id
        WHERE t.id = $1 AND t.school_id = $2 AND u.school_id = $2;
    `, [id, schoolId]);
    return result.rows[0];
};

const updateTeacher = async (client, id, teacherData, schoolId) => {
    const result = await client.query(`
        UPDATE teachers t SET
            surname = $1, first_name = $2, middle_name = $3, gender = $4,
            date_of_birth = $5, phone_number = $6, email = $7, address = $8,
            marital_status = $9, qualification_id = $10, department_id = $11,
            employment_date = $12, state_id = $13, nationality_id = $14,
            next_of_kin_name = $15, next_of_kin_phone = $16,
            emergency_contact_name = $17, emergency_contact_phone = $18,
            updated_at = CURRENT_TIMESTAMP
        WHERE t.id = $19 AND t.school_id = $20
        RETURNING t.*;
    `, [teacherData.surname, teacherData.first_name, teacherData.middle_name,
        teacherData.gender, teacherData.date_of_birth, teacherData.phone_number,
        teacherData.email, teacherData.address, teacherData.marital_status,
        teacherData.qualification_id, teacherData.department_id, teacherData.employment_date,
        teacherData.state_id, teacherData.nationality_id, teacherData.next_of_kin_name,
        teacherData.next_of_kin_phone, teacherData.emergency_contact_name,
        teacherData.emergency_contact_phone, id, schoolId]);
    return result.rows[0];
};

const deactivateTeacher = async (client, id, schoolId) => {
    const result = await client.query(`
        UPDATE teachers t SET status = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE t.id = $1 AND t.school_id = $2
        RETURNING t.*;
    `, [id, schoolId]);
    return result.rows[0];
};

const getTeacherByUserId = async (userId, schoolId) => {
    const result = await pool.query(`
        SELECT t.* FROM teachers t
        WHERE t.user_id = $1 AND t.school_id = $2;
    `, [userId, schoolId]);
    return result.rows[0];
};

module.exports = { createTeacher, getNextTeacherId, getTeachers, getTeacherById, updateTeacher, deactivateTeacher, getTeacherByUserId };
