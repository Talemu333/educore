const pool = require("../config/database");

const getSubjects = async () => {

    const query = `
        SELECT
            id,
            subject_name,
            subject_code,
            is_core,
            status
        FROM subjects
        ORDER BY subject_name;
    `;

    const result = await pool.query(query);

    return result.rows;

};

const createSubject = async (subjectData) => {

    const query = `
        INSERT INTO subjects
        (
            subject_name,
            subject_code,
            is_core
        )

        VALUES
        (
            $1,$2,$3
        )

        RETURNING *;
    `;

    const values = [

        subjectData.subject_name,

        subjectData.subject_code,

        subjectData.is_core ?? false

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

};

const getSubjectByCode = async (code) => {

    const result = await pool.query(

        `SELECT * FROM subjects WHERE subject_code = $1`,

        [code]

    );

    return result.rows[0];

};

const getSubjectByName = async (subjectName) => {

    const query = `
        SELECT *
        FROM subjects
        WHERE LOWER(subject_name) = LOWER($1);
    `;

    const result = await pool.query(query, [subjectName]);

    return result.rows[0];

};
const getSubjectById = async (id) => {

    const result = await pool.query(
        `SELECT * FROM subjects WHERE id = $1`,
        [id]
    );

    return result.rows[0];

};

const getSubjectsByClass = async (classId) => {

    const query = `

        SELECT

            s.id,

            s.subject_name

        FROM class_subjects cs

        JOIN subjects s

            ON s.id = cs.subject_id

        WHERE cs.class_id = $1

        ORDER BY s.subject_name;

    `;

    const result = await pool.query(query, [classId]);

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