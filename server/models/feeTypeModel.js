const pool = require("../config/database");

const createFeeType = async (data, schoolId, client = pool) => {
    const result = await client.query(`
        INSERT INTO fee_types (fee_name, description, school_id)
        VALUES ($1, $2, $3)
        RETURNING *;
    `, [data.fee_name, data.description, schoolId]);
    return result.rows[0];
};

const getFeeTypeById = async (id, schoolId) => {
    const result = await pool.query(`SELECT * FROM fee_types WHERE id = $1 AND school_id = $2`, [id, schoolId]);
    return result.rows[0];
};

const getFeeTypeByName = async (feeName, schoolId) => {
    const result = await pool.query(`SELECT * FROM fee_types WHERE LOWER(fee_name) = LOWER($1) AND school_id = $2`, [feeName, schoolId]);
    return result.rows[0];
};

const getFeeTypes = async (schoolId) => {
    const result = await pool.query(`SELECT * FROM fee_types WHERE school_id = $1 ORDER BY fee_name`, [schoolId]);
    return result.rows;
};

const updateFeeType = async (id, data, schoolId, client = pool) => {
    const result = await client.query(`
        UPDATE fee_types SET fee_name = $2, description = $3
        WHERE id = $1 AND school_id = $4 RETURNING *;
    `, [id, data.fee_name, data.description, schoolId]);
    return result.rows[0];
};

const deleteFeeType = async (id, schoolId, client = pool) => {
    const result = await client.query(`DELETE FROM fee_types WHERE id = $1 AND school_id = $2 RETURNING *`, [id, schoolId]);
    return result.rows[0];
};

module.exports = { createFeeType, getFeeTypeById, getFeeTypeByName, getFeeTypes, updateFeeType, deleteFeeType };