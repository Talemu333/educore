const pool = require("../config/database");

const createArm = async (armData, schoolId) => {
    const result = await pool.query(`
        INSERT INTO arms (class_id, arm_name, school_id)
        VALUES ($1, $2, $3)
        RETURNING *;
    `, [armData.class_id, armData.arm_name, schoolId]);
    return result.rows[0];
};

const getArmByName = async (classId, armName, schoolId) => {
    const result = await pool.query(`
        SELECT * FROM arms
        WHERE class_id = $1
        AND school_id = $3
        AND LOWER(arm_name) = LOWER($2);
    `, [classId, armName, schoolId]);
    return result.rows[0];
};

const getArmById = async (id, schoolId) => {
    const result = await pool.query(
        `SELECT * FROM arms WHERE id = $1 AND school_id = $2`,
        [id, schoolId]
    );
    return result.rows[0];
};

const getArms = async (schoolId) => {
    const result = await pool.query(`
        SELECT a.id, a.arm_name, a.class_id, c.class_name
        FROM arms a
        JOIN classes c ON a.class_id = c.id
        WHERE a.school_id = $1
        AND c.school_id = $1
        ORDER BY c.class_name, a.arm_name;
    `, [schoolId]);
    return result.rows;
};

const getArmsByClass = async (classId, schoolId) => {
    const result = await pool.query(`
        SELECT a.id, a.arm_name, a.class_id
        FROM arms a
        JOIN classes c ON c.id = a.class_id
        WHERE a.class_id = $1
        AND a.school_id = $2
        AND c.school_id = $2
        ORDER BY a.arm_name;
    `, [classId, schoolId]);
    return result.rows;
};

module.exports = {
    createArm,
    getArmByName,
    getArmById,
    getArms,
    getArmsByClass
};
