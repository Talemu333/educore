const pool = require("../config/database");

const getSubjects = async (schoolId) => {
    const result = await pool.query(`
        SELECT id, subject_name, subject_code, is_core, status
        FROM subjects
        WHERE school_id = $1
        ORDER BY subject_name;
    `, [schoolId]);
    return result.rows;
};

const createSubject = async (subjectData, schoolId) => {
    const result = await pool.query(`
        INSERT INTO subjects (subject_name, subject_code, is_core, school_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `, [subjectData.subject_name, subjectData.subject_code, subjectData.is_core ?? false, schoolId]);
    return result.rows[0];
};

const getSubjectByCode = async (code, schoolId) => {
    const result = await pool.query(`SELECT * FROM subjects WHERE subject_code = $1 AND school_id = $2`, [code, schoolId]);
    return result.rows[0];
};

const getSubjectByName = async (subjectName, schoolId) => {
    const result = await pool.query(`
        SELECT * FROM subjects
        WHERE LOWER(subject_name) = LOWER($1)
        AND school_id = $2;
    `, [subjectName, schoolId]);
    return result.rows[0];
};

const getSubjectById = async (id, schoolId) => {
    const result = await pool.query(`SELECT * FROM subjects WHERE id = $1 AND school_id = $2`, [id, schoolId]);
    return result.rows[0];
};

const getSubjectsByClass = async (classId, schoolId) => {
    const result = await pool.query(`
        SELECT s.id, s.subject_name
        FROM class_subjects cs
        JOIN subjects s ON s.id = cs.subject_id
        JOIN classes c ON c.id = cs.class_id
        WHERE cs.class_id = $1
        AND c.school_id = $2
        AND s.school_id = $2
        ORDER BY s.subject_name;
    `, [classId, schoolId]);
    return result.rows;
};

module.exports = {
    getSubjects,
    createSubject,
    getSubjectByCode,
    getSubjectByName,
    getSubjectById,
    getSubjectsByClass
};
