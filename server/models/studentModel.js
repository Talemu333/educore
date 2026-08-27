const pool = require("../config/database");

const createStudent = async (client, student, schoolId) => {
    const query = `
        INSERT INTO students
        (
            school_id,
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
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        RETURNING *;
    `;

    const values = [
        schoolId,
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

const validateClassArm = async (client, classId, armId, schoolId) => {
    const result = await client.query(`
        SELECT a.id
        FROM arms a
        INNER JOIN classes c ON c.id = a.class_id
        WHERE a.id = $1
          AND a.class_id = $2
          AND a.school_id = $3
          AND c.school_id = $3
    `, [armId, classId, schoolId]);

    return result.rows.length > 0;
};

const getAllStudents = async (limit, offset, schoolId) => {
    const result = await pool.query(`
        SELECT s.id, s.admission_number, s.surname, s.first_name,
               s.middle_name, s.gender, s.status,
               c.class_name, a.arm_name
        FROM students s
        INNER JOIN classes c ON s.class_id = c.id AND c.school_id = s.school_id
        INNER JOIN arms a ON s.arm_id = a.id AND a.school_id = s.school_id
        WHERE s.school_id = $3
          AND s.status = 'Active'
        ORDER BY s.surname, s.first_name
        LIMIT $1 OFFSET $2;
    `, [limit, offset, schoolId]);

    return result.rows;
};

const countStudents = async (schoolId) => {
    const result = await pool.query(`
        SELECT COUNT(*) AS total
        FROM students
        WHERE school_id = $1;
    `, [schoolId]);

    return Number(result.rows[0].total);
};

const getStudentById = async (id, schoolId) => {
    const result = await pool.query(`
        SELECT s.*, c.class_name, a.arm_name,
               st.state_name, n.nationality_name
        FROM students s
        INNER JOIN classes c ON s.class_id = c.id AND c.school_id = s.school_id
        INNER JOIN arms a ON s.arm_id = a.id AND a.school_id = s.school_id
        LEFT JOIN states st ON s.state_id = st.id
        LEFT JOIN nationalities n ON s.nationality_id = n.id
        WHERE s.id = $1 AND s.school_id = $2;
    `, [id, schoolId]);

    return result.rows[0];
};

const updateStudent = async (client, id, student, schoolId) => {
    const result = await client.query(`
        UPDATE students
        SET surname=$1, first_name=$2, middle_name=$3, gender=$4,
            date_of_birth=$5, state_id=$6, nationality_id=$7,
            religion=$8, blood_group=$9, genotype=$10,
            residential_address=$11, class_id=$12, arm_id=$13,
            updated_at=CURRENT_TIMESTAMP
        WHERE id=$14 AND school_id=$15
        RETURNING *;
    `, [
        student.surname, student.first_name, student.middle_name,
        student.gender, student.date_of_birth, student.state_id,
        student.nationality_id, student.religion, student.blood_group,
        student.genotype, student.residential_address, student.class_id,
        student.arm_id, id, schoolId
    ]);

    return result.rows[0];
};

const getStudentsByClass = async (classId, armId, schoolId) => {
    const result = await pool.query(`
        SELECT * FROM students
        WHERE school_id = $1
          AND class_id = $2
          AND (arm_id = $3 OR (arm_id IS NULL AND $3 IS NULL))
        ORDER BY surname, first_name;
    `, [schoolId, classId, armId]);

    return result.rows;
};

const updateCurrentClass = async (studentId, classId, armId, schoolId, client = pool) => {
    await client.query(`
        UPDATE students
        SET class_id = $2, arm_id = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND school_id = $4;
    `, [studentId, classId, armId, schoolId]);
};

const searchStudents = async (searchTerm, limit, offset, schoolId) => {
    const result = await pool.query(`
        SELECT s.id, s.admission_number, s.surname, s.first_name,
               s.middle_name, s.gender, c.class_name, a.arm_name
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id AND c.school_id = s.school_id
        LEFT JOIN arms a ON s.arm_id = a.id AND a.school_id = s.school_id
        WHERE s.school_id = $4
          AND s.status = 'Active'
          AND (
              LOWER(s.surname) LIKE LOWER($1)
              OR LOWER(s.first_name) LIKE LOWER($1)
              OR LOWER(COALESCE(s.middle_name,'')) LIKE LOWER($1)
              OR LOWER(s.admission_number) LIKE LOWER($1)
          )
        ORDER BY s.surname, s.first_name
        LIMIT $2 OFFSET $3;
    `, [`%${searchTerm}%`, limit, offset, schoolId]);

    return result.rows;
};

const countSearchStudents = async (searchTerm, schoolId) => {
    const result = await pool.query(`
        SELECT COUNT(*) AS total
        FROM students
        WHERE school_id = $2
          AND (
              LOWER(surname) LIKE LOWER($1)
              OR LOWER(first_name) LIKE LOWER($1)
              OR LOWER(COALESCE(middle_name,'')) LIKE LOWER($1)
              OR LOWER(admission_number) LIKE LOWER($1)
          );
    `, [`%${searchTerm}%`, schoolId]);

    return Number(result.rows[0].total);
};

const deactivateStudent = async (client, id, schoolId) => {
    const result = await client.query(`
        UPDATE students
        SET status = 'Inactive', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND school_id = $2
        RETURNING *;
    `, [id, schoolId]);

    return result.rows[0];
};

const getStudentParents = async (studentId, schoolId) => {
    const result = await pool.query(`
        SELECT p.id, p.user_id, u.username, p.surname, p.first_name,
               p.middle_name, p.gender, p.phone_number, p.alternate_phone,
               p.email, p.occupation, p.residential_address,
               sp.relationship_id, r.relationship_name,
               sp.is_primary_contact
        FROM student_parents sp
        INNER JOIN parents p ON sp.parent_id = p.id AND p.school_id = $2
        INNER JOIN users u ON p.user_id = u.id AND u.school_id = $2
        LEFT JOIN relationships r ON sp.relationship_id = r.id
        INNER JOIN students s ON sp.student_id = s.id AND s.school_id = $2
        WHERE sp.student_id = $1
        ORDER BY sp.is_primary_contact DESC, p.surname;
    `, [studentId, schoolId]);

    return result.rows;
};

module.exports = {
    createStudent,
    validateClassArm,
    getAllStudents,
    getStudentById,
    updateStudent,
    getStudentsByClass,
    updateCurrentClass,
    searchStudents,
    countStudents,
    countSearchStudents,
    deactivateStudent,
    getStudentParents
};
