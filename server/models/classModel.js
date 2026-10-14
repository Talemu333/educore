const pool = require("../config/database");

const getClasses = async (schoolId, client = pool) => {
    const result = await client.query(`
        WITH ranked_classes AS (
            SELECT
                id,
                class_name,
                class_level,
                sort_order,
                ROW_NUMBER() OVER (
                    PARTITION BY LOWER(REGEXP_REPLACE(BTRIM(class_name), '[[:space:]]+', ' ', 'g'))
                    ORDER BY sort_order NULLS LAST, id
                ) AS duplicate_rank
            FROM classes
            WHERE school_id = $1
        )
        SELECT id, class_name, class_level, sort_order
        FROM ranked_classes
        WHERE duplicate_rank = 1
        ORDER BY sort_order NULLS LAST, id;
    `, [schoolId]);
    return result.rows;
};

const getClassArms = async (classId, schoolId, client = pool) => {
    const result = await client.query(`
        SELECT a.id, a.arm_name FROM arms a
        WHERE a.class_id = $1 AND a.school_id = $2 ORDER BY a.arm_name;
    `, [classId, schoolId]);
    return result.rows;
};

const createClass = async (classData, schoolId, client = pool) => {
    const result = await client.query(`
        INSERT INTO classes (class_name, class_level, sort_order, school_id)
        VALUES ($1, $2, $3, $4) RETURNING *;
    `, [classData.class_name, classData.class_level, classData.sort_order, schoolId]);
    return result.rows[0];
};

const getClassByName = async (className, schoolId, client = pool) => {
    const result = await client.query(`
        SELECT *
        FROM classes
        WHERE LOWER(REGEXP_REPLACE(BTRIM(class_name), '[[:space:]]+', ' ', 'g')) =
              LOWER(REGEXP_REPLACE(BTRIM($1), '[[:space:]]+', ' ', 'g'))
          AND school_id = $2
        LIMIT 1
    `, [className, schoolId]);
    return result.rows[0];
};

const getClassById = async (id, schoolId, client = pool) => {
    const result = await client.query(`SELECT * FROM classes WHERE id = $1 AND school_id = $2`, [id, schoolId]);
    return result.rows[0];
};

module.exports = { getClasses, getClassArms, createClass, getClassByName, getClassById };