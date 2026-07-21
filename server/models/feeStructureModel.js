const pool = require("../config/database");

const feeTypeInUse = async (feeTypeId) => {

    const query = `

        SELECT 1

        FROM fee_structures

        WHERE fee_type_id = $1

        LIMIT 1;

    `;

    const result = await pool.query(query, [feeTypeId]);

    return result.rowCount > 0;

};

const createFeeStructure = async (data, client = pool) => {

    const query = `

        INSERT INTO fee_structures (

            session_id,

            term_id,

            class_id,

            fee_type_id,

            amount

        )

        VALUES ($1,$2,$3,$4,$5)

        RETURNING *;

    `;

    const values = [

        data.session_id,

        data.term_id,

        data.class_id,

        data.fee_type_id,

        data.amount

    ];

    const result = await client.query(query, values);

    return result.rows[0];

};

const feeStructureExists = async (

    sessionId,

    termId,

    classId,

    feeTypeId

) => {

    const query = `

        SELECT 1

        FROM fee_structures

        WHERE

            session_id = $1

            AND term_id = $2

            AND class_id = $3

            AND fee_type_id = $4

        LIMIT 1;

    `;

    const result = await pool.query(

        query,

        [

            sessionId,

            termId,

            classId,

            feeTypeId

        ]

    );

    return result.rowCount > 0;

};

const getFeeStructureById = async (id) => {

    const query = `

        SELECT *

        FROM fee_structures

        WHERE id = $1;

    `;

    const result = await pool.query(query,[id]);

    return result.rows[0];

};

const getFeeStructures = async () => {

    const query = `

        SELECT

            fs.id,

            s.session_name,

            t.term_name,

            c.class_name,

            ft.fee_name,

            fs.amount

        FROM fee_structures fs

        JOIN academic_sessions s

            ON fs.session_id = s.id

        JOIN terms t

            ON fs.term_id = t.id

        JOIN classes c

            ON fs.class_id = c.id

        JOIN fee_types ft

            ON fs.fee_type_id = ft.id

        ORDER BY

            s.session_name,

            t.term_name,

            c.class_name,

            ft.fee_name;

    `;

    const result = await pool.query(query);

    return result.rows;

};

const updateFeeStructure = async (

    id,

    data,

    client = pool

) => {

    const query = `

        UPDATE fee_structures

        SET

            amount = $2

        WHERE id = $1

        RETURNING *;

    `;

    const result = await client.query(

        query,

        [

            id,

            data.amount

        ]

    );

    return result.rows[0];

};

const getTotalFeesForClass = async (
    sessionId,
    termId,
    classId
) => {

    const query = `
        SELECT
            COALESCE(SUM(amount), 0) AS total
        FROM fee_structures
        WHERE
            session_id = $1
            AND term_id = $2
            AND class_id = $3;
    `;

    const result = await pool.query(
        query,
        [sessionId, termId, classId]
    );

    return Number(result.rows[0].total);
};

module.exports = {
    feeTypeInUse,
    createFeeStructure,
    feeStructureExists,
    getFeeStructureById,
    getFeeStructures,
    updateFeeStructure,
    getTotalFeesForClass
}