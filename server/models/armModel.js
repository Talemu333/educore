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

const getArms = async () => {

    const query = `

        SELECT
            a.id,
            a.arm_name,
            a.class_id,
            c.class_name
        FROM arms a
        JOIN classes c
            ON a.class_id = c.id
        ORDER BY c.class_name, a.arm_name;

    `;

    const result = await pool.query(query);

    return result.rows;

};

const getArmsByClass = async (classId) => {

    const query = `
        SELECT
            id,
            arm_name,
            class_id
        FROM arms
        WHERE class_id = $1
        ORDER BY arm_name;
    `;

    const result = await pool.query(query, [classId]);

    return result.rows;

};

module.exports = {

    createArm,
    getArmByName,
    getArmById,
    getArms,
    getArmsByClass

};