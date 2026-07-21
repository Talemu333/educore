const pool = require("../config/database");

const createTeacher = async (client, teacherData) => {

    const query = `

        INSERT INTO teachers (
            id,

            user_id,

            staff_number,

            surname,

            first_name,

            middle_name,

            gender,

            date_of_birth,

            phone_number,

            email,

            address,

            marital_status,

            qualification_id,

            department_id,

            employment_date,

            state_id,

            nationality_id,

            next_of_kin_name,

            next_of_kin_phone,

            emergency_contact_name,

            emergency_contact_phone

        )

        VALUES (

            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,

            $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21

        )

        RETURNING *;

    `;

    const values = [
        teacherData.id,

        teacherData.user_id,

        teacherData.staff_number,

        teacherData.surname,

        teacherData.first_name,

        teacherData.middle_name,

        teacherData.gender,

        teacherData.date_of_birth,

        teacherData.phone_number,

        teacherData.email,

        teacherData.address,

        teacherData.marital_status,

        teacherData.qualification_id,

        teacherData.department_id,

        teacherData.employment_date,

        teacherData.state_id,

        teacherData.nationality_id,

        teacherData.next_of_kin_name,

        teacherData.next_of_kin_phone,

        teacherData.emergency_contact_name,

        teacherData.emergency_contact_phone

    ];

    const result = await client.query(query, values);

    return result.rows[0];

};

const getNextTeacherId = async (client) => {

    const result = await client.query(

        "SELECT nextval(pg_get_serial_sequence('teachers', 'id')) AS id"

    );

    return result.rows[0].id;

};

const getTeachers = async () => {

    const query = `

        SELECT

            t.id,

            t.staff_number,

            CONCAT(
                t.surname,
                ' ',
                t.first_name,
                ' ',
                COALESCE(t.middle_name,'')
            ) AS full_name,

            d.department_name,

            q.qualification_name,

            t.phone_number,

            t.email,

            t.status

        FROM teachers t

        LEFT JOIN departments d
            ON d.id = t.department_id

        LEFT JOIN qualifications q
            ON q.id = t.qualification_id

        ORDER BY t.surname, t.first_name;

    `;

    const result = await pool.query(query);

    return result.rows;

};

const getTeacherById = async (id) => {

    const query = `

        SELECT

            t.*,

            d.department_name,

            q.qualification_name,

            s.state_name,

            n.nationality_name,

            u.username

        FROM teachers t

        JOIN users u
            ON u.id = t.user_id

        LEFT JOIN departments d
            ON d.id = t.department_id

        LEFT JOIN qualifications q
            ON q.id = t.qualification_id

        LEFT JOIN states s
            ON s.id = t.state_id

        LEFT JOIN nationalities n
            ON n.id = t.nationality_id

        WHERE t.id = $1;

    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];

};

module.exports = {

    createTeacher,
    getNextTeacherId,
    getTeachers,
    getTeacherById

};