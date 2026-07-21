const pool = require("../config/database");

const createFeeType = async (data, client = pool) => {

    const query = `

        INSERT INTO fee_types (

            fee_name,

            description

        )

        VALUES ($1, $2)

        RETURNING *;

    `;

    const values = [

        data.fee_name,

        data.description

    ];

    const result = await client.query(query, values);

    return result.rows[0];

};

const getFeeTypeById = async (id) => {

    const query = `

        SELECT *

        FROM fee_types

        WHERE id = $1;

    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];

};

const getFeeTypeByName = async (feeName) => {

    const query = `

        SELECT *

        FROM fee_types

        WHERE LOWER(fee_name) = LOWER($1);

    `;

    const result = await pool.query(query, [feeName]);

    return result.rows[0];

};

const getFeeTypes = async () => {

    const query = `

        SELECT *

        FROM fee_types

        ORDER BY fee_name;

    `;

    const result = await pool.query(query);

    return result.rows;

};
const updateFeeType = async (id, data, client = pool) => {

    const query = `

        UPDATE fee_types

        SET

            fee_name = $2,

            description = $3

        WHERE id = $1

        RETURNING *;

    `;

    const values = [

        id,

        data.fee_name,

        data.description

    ];

    const result = await client.query(query, values);

    return result.rows[0];

};

const deleteFeeType = async (id, client = pool) => {

    const query = `

        DELETE FROM fee_types

        WHERE id = $1

        RETURNING *;

    `;

    const result = await client.query(query, [id]);

    return result.rows[0];

};
module.exports = {
    createFeeType,
    getFeeTypeById,
    getFeeTypeByName,
    getFeeTypes,
    updateFeeType,
    deleteFeeType
}