const pool = require("../config/database");

const getClasses = async (schoolId) => {
    const result = await pool.query(`
        SELECT id, class_name, class_level, sort_order
        FROM classes WHERE school_id = $1 ORDER BY sort_order;
    `, [schoolId]);
    return result.rows;
};

const getClassArms = async (classId, schoolId) => {
    const result = await pool.query(`
        SELECT a.id, a.arm_name FROM arms a
        WHERE a.class_id = $1 AND a.school_id = $2 ORDER BY a.arm_name;
    `, [classId, schoolId]);
    return result.rows;
};

const createClass = async (classData, schoolId) => {
    const result = await pool.query(`
        INSERT INTO classes (class_name, class_level, sort_order, school_id)
        VALUES ($1, $2, $3, $4) RETURNING *;
    `, [classData.class_name, classData.class_level, classData.sort_order, schoolId]);
    return result.rows[0];
};

const getClassByName = async (className, schoolId) => {
    const result = await pool.query(`
        SELECT * FROM classes WHERE LOWER(class_name) = LOWER($1) AND school_id = $2 LIMIT 1;
    `, [className, schoolId]);
    return result.rows[0];
};

const getClassById = async (id, schoolId) => {
    const result = await pool.query(`SELECT * FROM classes WHERE id = $1 AND school_id = $2`, [id, schoolId]);
    return result.rows[0];
};

module.exports = { getClasses, getClassArms, createClass, getClassByName, getClassById };