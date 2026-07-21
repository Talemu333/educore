const pool = require("../config/database");

const getClasses = async () => {
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

const getClassArms = async (classId) => {

    const query = `
        SELECT
            id,
            arm_name
        FROM arms
        WHERE class_id = $1
        ORDER BY arm_name;
    `;

    const result = await pool.query(query, [classId]);

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

const getClassByName = async (className) => {

    const query = `
        SELECT *
        FROM classes
        WHERE LOWER(class_name) = LOWER($1)
        LIMIT 1;
    `;

    const result = await pool.query(query, [className]);

    return result.rows[0];

};

const getClassById = async (id) => {

    const result = await pool.query(
        `SELECT * FROM classes WHERE id = $1`,
        [id]
    );

    return result.rows[0];

};

module.exports = {
    getClasses,
    getClassArms,
    createClass,
    getClassByName,
    getClassById 
};