const pool = require("../config/database");


const createAnnouncement = async (data) => {

    const query = `

        INSERT INTO announcements

        (
            title,
            message,
            audience,
            created_by,
            expiry_date
        )

        VALUES

        ($1,$2,$3,$4,$5)

        RETURNING *

    `;


    const result = await pool.query(

        query,

        [

            data.title,

            data.message,

            data.audience,

            data.created_by,

            data.expiry_date

        ]

    );


    return result.rows[0];

};


const getAnnouncements = async () => {


    const query = `

        SELECT *

        FROM announcements

        WHERE is_active = TRUE

        ORDER BY created_at DESC

    `;


    const result = await pool.query(query);


    return result.rows;


};

const updateAnnouncement = async (id, data) => {

    const query = `

        UPDATE announcements

        SET

            title = $1,

            message = $2,

            audience = $3,

            expiry_date = $4,

            updated_at = CURRENT_TIMESTAMP

        WHERE id = $5

        RETURNING *

    `;


    const result = await pool.query(

        query,

        [

            data.title,

            data.message,

            data.audience,

            data.expiry_date,

            id

        ]

    );


    return result.rows[0];

};

const deactivateAnnouncement = async (id) => {

    const query = `

        UPDATE announcements

        SET

            is_active = FALSE,

            updated_at = CURRENT_TIMESTAMP

        WHERE id = $1

        RETURNING *

    `;


    const result = await pool.query(

        query,

        [id]

    );


    return result.rows[0];

};


module.exports = {

    createAnnouncement,

    getAnnouncements,
    updateAnnouncement,
    deactivateAnnouncement

};