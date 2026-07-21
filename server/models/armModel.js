const pool = require("../config/database");

const createArm = async (armData) => {

    const query = `
        INSERT INTO arms
        (
            class_id,
            arm_name
        )
        VALUES
        (
            $1,
            $2
        )
        RETURNING *;
    `;

    const result = await pool.query(query, [

        armData.class_id,

        armData.arm_name

    ]);

    return result.rows[0];

};

const getArmByName = async (classId, armName) => {

    const query = `
        SELECT *
        FROM arms
        WHERE class_id = $1
        AND LOWER(arm_name) = LOWER($2);
    `;

    const result = await pool.query(query, [

        classId,

        armName

    ]);

    return result.rows[0];

};
const getArmById = async (id) => {

    const result = await pool.query(
        `SELECT * FROM arms WHERE id = $1`,
        [id]
    );

    return result.rows[0];

};

module.exports = {

    createArm,

    getArmByName,
    getArmById

};