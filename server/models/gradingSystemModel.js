const pool = require("../config/database");

const getAllGradingScales = async (schoolId) => {
    const result = await pool.query(`
        SELECT id, school_id, grade, min_score, max_score,
               remark, created_at, updated_at
        FROM grading_systems
        WHERE school_id = $1
        ORDER BY min_score DESC;
    `, [schoolId]);

    return result.rows;
};

const getGradingSystemById = async (id, schoolId) => {
    const result = await pool.query(`
        SELECT *
        FROM grading_systems
        WHERE id = $1 AND school_id = $2;
    `, [id, schoolId]);

    return result.rows[0];
};

const createGradingSystem = async (data, schoolId) => {
    const result = await pool.query(`
        INSERT INTO grading_systems (
            school_id, grade, min_score, max_score, remark
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `, [schoolId, data.grade, data.min_score, data.max_score, data.remark]);

    return result.rows[0];
};

const updateGradingSystem = async (id, data, schoolId) => {
    const result = await pool.query(`
        UPDATE grading_systems
        SET grade = $1,
            min_score = $2,
            max_score = $3,
            remark = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 AND school_id = $6
        RETURNING *;
    `, [data.grade, data.min_score, data.max_score, data.remark, id, schoolId]);

    return result.rows[0];
};

const deleteGradingSystem = async (id, schoolId) => {
    const result = await pool.query(`
        DELETE FROM grading_systems
        WHERE id = $1 AND school_id = $2
        RETURNING *;
    `, [id, schoolId]);

    return result.rows[0];
};

const getGradeForScore = async (score, schoolId) => {
    const result = await pool.query(`
        SELECT grade, remark
        FROM grading_systems
        WHERE school_id = $2
          AND $1 >= min_score
          AND $1 <= max_score
        ORDER BY min_score DESC
        LIMIT 1;
    `, [score, schoolId]);

    return result.rows[0];
};

module.exports = {
    getAllGradingScales,
    getGradingSystemById,
    createGradingSystem,
    updateGradingSystem,
    deleteGradingSystem,
    getGradeForScore
};