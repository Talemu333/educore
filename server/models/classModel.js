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

module.exports = {
    getAllClasses
};