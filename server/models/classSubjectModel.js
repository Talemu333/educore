const pool = require("../config/database");

const deleteByClassId = async (client, classId, schoolId) => {
    await client.query(
        `DELETE FROM class_subjects cs
         USING classes c
         WHERE cs.class_id = c.id
           AND cs.class_id = $1
           AND c.school_id = $2`,
        [classId, schoolId]
    );
};

const create = async (client, { class_id, subject_id, is_compulsory }, schoolId) => {
    const result = await client.query(`
        INSERT INTO class_subjects (class_id, subject_id, is_compulsory, school_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `, [class_id, subject_id, is_compulsory, schoolId]);

    return result.rows[0];
};

const getByClassId = async (classId, schoolId) => {
    const result = await pool.query(`
        SELECT
            s.id,
            cs.class_id,
            cs.subject_id,
            cs.is_compulsory,
            s.subject_name
        FROM class_subjects cs
        JOIN subjects s ON s.id = cs.subject_id
        JOIN classes c ON c.id = cs.class_id
        WHERE cs.class_id = $1
        AND cs.school_id = $2
        AND c.school_id = $2
        AND s.school_id = $2
        ORDER BY s.subject_name;
    `, [classId, schoolId]);

    return result.rows;
};

module.exports = {
    deleteByClassId,
    create,
    getByClassId
};
