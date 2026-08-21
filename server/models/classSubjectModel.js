const pool = require("../config/database");

const deleteByClassId = async (client, classId) => {

    await client.query(

        `

        DELETE FROM class_subjects

        WHERE class_id = $1

        `,

        [classId]

    );

};

const create = async (

    client,

    {

        class_id,

        subject_id,

        is_compulsory

    }

) => {

    const result = await client.query(

            `

            INSERT INTO class_subjects (

                class_id,

                subject_id,

                is_compulsory

            )

            VALUES ($1,$2,$3)

            RETURNING *;

            `,

            [

                class_id,

                subject_id,

                is_compulsory

            ]

        );

        return result.rows[0];

    };

    const getByClassId = async (classId) => {

        const result = await pool.query(
    `
    SELECT

        s.id,

        cs.class_id,

        cs.subject_id,

        cs.is_compulsory,

        s.subject_name

    FROM class_subjects cs

    JOIN subjects s
        ON s.id = cs.subject_id

    WHERE cs.class_id = $1

    ORDER BY s.subject_name;
    `,
    [classId]
    );

    return result.rows;

};

module.exports = {

    deleteByClassId,

    create,

    getByClassId

};