const pool = require("../config/database");


/*
=========================================
GET PROMOTION HISTORY
=========================================
*/

const getPromotionHistory = async ({
    action,
    sessionId,
    search,
    page = 1,
    limit = 20
}) => {

    const values = [];

    const conditions = [];


    /*
    =========================================
    PAGINATION
    =========================================
    */

    const currentPage =
        Math.max(
            Number(page) || 1,
            1
        );


    const pageLimit =
        Math.min(
            Math.max(
                Number(limit) || 20,
                1
            ),
            100
        );


    const offset =
        (currentPage - 1) *
        pageLimit;


    /*
    =========================================
    ACTION FILTER
    =========================================
    */

    if (action) {

        values.push(action);

        conditions.push(
            `h.action = $${values.length}`
        );

    }


    /*
    =========================================
    SESSION FILTER
    =========================================
    */

    if (sessionId) {

        values.push(
            Number(sessionId)
        );

        conditions.push(`

            (
                h.from_session_id = $${values.length}

                OR

                h.to_session_id = $${values.length}

            )

        `);

    }


    /*
    =========================================
    SEARCH FILTER
    =========================================
    */

    if (search) {

        values.push(
            `%${search.trim()}%`
        );


        const searchParameter =
            `$${values.length}`;


        conditions.push(`

            (
                s.admission_number ILIKE ${searchParameter}

                OR

                s.surname ILIKE ${searchParameter}

                OR

                s.first_name ILIKE ${searchParameter}

                OR

                s.middle_name ILIKE ${searchParameter}

                OR

                CONCAT(
                    s.surname,
                    ' ',
                    s.first_name,
                    ' ',
                    COALESCE(
                        s.middle_name,
                        ''
                    )
                ) ILIKE ${searchParameter}

            )

        `);

    }


    /*
    =========================================
    WHERE CLAUSE
    =========================================
    */

    const whereClause =
        conditions.length > 0

            ? `WHERE ${conditions.join(" AND ")}`

            : "";


    /*
    =========================================
    COUNT TOTAL RECORDS
    =========================================
    */

    const countQuery = `

        SELECT
            COUNT(*) AS total

        FROM student_promotion_history h

        INNER JOIN students s
            ON s.id = h.student_id

        ${whereClause};

    `;


    const countResult =
        await pool.query(
            countQuery,
            values
        );


    const total =
        Number(
            countResult.rows[0]?.total || 0
        );


    /*
    =========================================
    GET HISTORY
    =========================================
    */

    const dataValues = [
        ...values,
        pageLimit,
        offset
    ];


    const limitParameter =
        `$${values.length + 1}`;


    const offsetParameter =
        `$${values.length + 2}`;


    const historyQuery = `

        SELECT

            /*
            =================================
            HISTORY
            =================================
            */

            h.id,

            h.action,

            h.remarks,

            h.processed_at,


            /*
            =================================
            STUDENT
            =================================
            */

            s.id AS student_id,

            s.admission_number,

            s.surname,

            s.first_name,

            s.middle_name,

            s.gender,


            /*
            =================================
            FROM SESSION
            =================================
            */

            fs.id AS from_session_id,

            fs.session_name AS from_session_name,


            /*
            =================================
            TO SESSION
            =================================
            */

            ts.id AS to_session_id,

            ts.session_name AS to_session_name,


            /*
            =================================
            FROM CLASS
            =================================
            */

            fc.id AS from_class_id,

            fc.class_name AS from_class_name,


            /*
            =================================
            TO CLASS
            =================================
            */

            tc.id AS to_class_id,

            tc.class_name AS to_class_name,


            /*
            =================================
            FROM ARM
            =================================
            */

            fa.id AS from_arm_id,

            fa.arm_name AS from_arm_name,


            /*
            =================================
            TO ARM
            =================================
            */

            ta.id AS to_arm_id,

            ta.arm_name AS to_arm_name,


            /*
            =================================
            PROCESSOR
            =================================
            */

            u.id AS processed_by,

            u.username AS processed_by_username,

            u.email AS processed_by_email,

            u.admin_type AS processed_by_admin_type


        FROM student_promotion_history h


        /*
        =====================================
        STUDENT
        =====================================
        */

        INNER JOIN students s
            ON s.id = h.student_id


        /*
        =====================================
        SESSIONS
        =====================================
        */

        INNER JOIN academic_sessions fs
            ON fs.id = h.from_session_id


        LEFT JOIN academic_sessions ts
            ON ts.id = h.to_session_id


        /*
        =====================================
        CLASSES
        =====================================
        */

        INNER JOIN classes fc
            ON fc.id = h.from_class_id


        LEFT JOIN classes tc
            ON tc.id = h.to_class_id


        /*
        =====================================
        ARMS
        =====================================
        */

        LEFT JOIN arms fa
            ON fa.id = h.from_arm_id


        LEFT JOIN arms ta
            ON ta.id = h.to_arm_id


        /*
        =====================================
        PROCESSOR
        =====================================
        */

        LEFT JOIN users u
            ON u.id = h.processed_by


        ${whereClause}


        ORDER BY
            h.processed_at DESC,
            h.id DESC


        LIMIT ${limitParameter}

        OFFSET ${offsetParameter};

    `;


    const historyResult =
        await pool.query(
            historyQuery,
            dataValues
        );


    /*
    =========================================
    PAGINATION INFORMATION
    =========================================
    */

    const totalPages =
        total === 0
            ? 0
            : Math.ceil(
                total / pageLimit
            );


    return {

        history:
            historyResult.rows,

        pagination: {

            page:
                currentPage,

            limit:
                pageLimit,

            total,

            totalPages

        }

    };

};


module.exports = {

    getPromotionHistory

};