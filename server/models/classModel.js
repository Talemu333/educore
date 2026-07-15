const pool = require("../config/database");

const getAllClasses = async () => {
    const query = `
        SELECT
            id,
            class_name,
            class_level,
            sort_order
        FROM classes
        ORDER BY sort_order;
    `;

    const result = await pool.query(query);
    return result.rows;
};

const createClass = async (classData) => {

    const query = `
        INSERT INTO classes
        (
            class_name,
            class_level,
            sort_order
        )
        VALUES ($1, $2, $3)
        RETURNING *;
    `;

    const values = [
        classData.class_name,
        classData.class_level,
        classData.sort_order
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

module.exports = {
    getAllClasses,
    createClass
};