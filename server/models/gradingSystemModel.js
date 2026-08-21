const pool = require("../config/database");


const getAllGradingScales = async () => {

    const query = `

        SELECT

            id,

            grade,

            min_score,

            max_score,

            remark,

            created_at,

            updated_at

        FROM grading_systems

        ORDER BY min_score DESC;

    `;

    const result =
        await pool.query(query);

    return result.rows;

};


const getGradingSystemById = async (id) => {

    const query = `

        SELECT *

        FROM grading_systems

        WHERE id = $1;

    `;

    const result =
        await pool.query(
            query,
            [id]
        );

    return result.rows[0];

};


const createGradingSystem = async (data) => {

    const query = `

        INSERT INTO grading_systems (

            grade,

            min_score,

            max_score,

            remark

        )

        VALUES ($1, $2, $3, $4)

        RETURNING *;

    `;

    const values = [

        data.grade,

        data.min_score,

        data.max_score,

        data.remark

    ];

    const result =
        await pool.query(
            query,
            values
        );

    return result.rows[0];

};


const updateGradingSystem = async (
    id,
    data
) => {

    const query = `

        UPDATE grading_systems

        SET

            grade = $1,

            min_score = $2,

            max_score = $3,

            remark = $4,

            updated_at = CURRENT_TIMESTAMP

        WHERE id = $5

        RETURNING *;

    `;

    const values = [

        data.grade,

        data.min_score,

        data.max_score,

        data.remark,

        id

    ];

    const result =
        await pool.query(
            query,
            values
        );

    return result.rows[0];

};


const deleteGradingSystem = async (id) => {

    const query = `

        DELETE FROM grading_systems

        WHERE id = $1

        RETURNING *;

    `;

    const result =
        await pool.query(
            query,
            [id]
        );

    return result.rows[0];

};


const getGradeForScore = async (score) => {

    const query = `

        SELECT

            grade,

            remark

        FROM grading_systems

        WHERE

            $1 >= min_score

            AND

            $1 <= max_score

        ORDER BY min_score DESC

        LIMIT 1;

    `;

    const result =
        await pool.query(
            query,
            [score]
        );

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