const pool = require("../config/database");

const createStudent = async (client, student) => {

    const query = `
        INSERT INTO students
        (
            admission_number,
            admission_sequence,
            surname,
            first_name,
            middle_name,
            gender,
            date_of_birth,
            state_id,
            nationality_id,
            religion,
            blood_group,
            genotype,
            residential_address,
            class_id,
            arm_id,
            admission_date
        )

        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
        )

        RETURNING *;
    `;

    const values = [

        student.admission_number,

        student.admission_sequence,

        student.surname,

        student.first_name,

        student.middle_name,

        student.gender,

        student.date_of_birth,

        student.state_id,

        student.nationality_id,

        student.religion,

        student.blood_group,

        student.genotype,

        student.residential_address,

        student.class_id,

        student.arm_id,

        student.admission_date

    ];

    const result = await client.query(query, values);

    return result.rows[0];

};

const validateClassArm = async (client, classId, armId) => {

    const query = `
        SELECT id
        FROM arms
        WHERE id = $1
        AND class_id = $2
    `;

    const result = await client.query(query, [armId, classId]);

    return result.rows.length > 0;

};

const getAllStudents = async () => {

    const query = `
        SELECT
            s.id,
            s.admission_number,
            s.surname,
            s.first_name,
            s.middle_name,
            s.gender,
            s.status,

            c.class_name,

            a.arm_name

        FROM students s

        INNER JOIN classes c
            ON s.class_id = c.id

        INNER JOIN arms a
            ON s.arm_id = a.id

        ORDER BY
            s.surname,
            s.first_name;
    `;

    const result = await pool.query(query);

    return result.rows;
};

const getStudentById = async (id) => {

    const query = `
        SELECT

            s.*,

            c.class_name,

            a.arm_name,

            st.state_name,

            n.nationality_name

        FROM students s

        INNER JOIN classes c
            ON s.class_id = c.id

        INNER JOIN arms a
            ON s.arm_id = a.id

        LEFT JOIN states st
            ON s.state_id = st.id

        LEFT JOIN nationalities n
            ON s.nationality_id = n.id

        WHERE s.id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];

};

const updateStudent = async (client, id, student) => {

    const query = `
        UPDATE students

        SET

            surname=$1,

            first_name=$2,

            middle_name=$3,

            gender=$4,

            date_of_birth=$5,

            state_id=$6,

            nationality_id=$7,

            religion=$8,

            blood_group=$9,

            genotype=$10,

            residential_address=$11,

            class_id=$12,

            arm_id=$13,

            updated_at=CURRENT_TIMESTAMP

        WHERE id=$14

        RETURNING *;
    `;

    const values = [

        student.surname,

        student.first_name,

        student.middle_name,

        student.gender,

        student.date_of_birth,

        student.state_id,

        student.nationality_id,

        student.religion,

        student.blood_group,

        student.genotype,

        student.residential_address,

        student.class_id,

        student.arm_id,

        id

    ];

    const result = await client.query(query, values);

    return result.rows[0];

};

module.exports = {
    createStudent,
    validateClassArm,
    getAllStudents,
    getStudentById,
    updateStudent
};