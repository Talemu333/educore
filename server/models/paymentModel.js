const pool = require("../config/database");

const createPayment = async (data, client = pool) => {

    const query = `

        INSERT INTO student_payments (

            student_id,

            session_id,

            term_id,

            amount_paid,

            payment_date,

            payment_method,

            reference_number,

            received_by,

            remarks

        )

        VALUES (

            $1,$2,$3,$4,$5,$6,$7,$8,$9

        )

        RETURNING *;

    `;

    const values = [

        data.student_id,

        data.session_id,

        data.term_id,

        data.amount_paid,

        data.payment_date,

        data.payment_method,

        data.reference_number,

        data.received_by,

        data.remarks

    ];

    const result =
        await client.query(query, values);

    return result.rows[0];

};

const getStudentPayments = async (

    studentId,

    sessionId,

    termId

) => {

    const query = `

        SELECT

            sp.id,

            sp.payment_date,

            sp.amount_paid,

            sp.payment_method,

            sp.reference_number,

            sp.remarks,

            u.username AS received_by

        FROM student_payments sp

        LEFT JOIN users u

            ON sp.received_by = u.id

        WHERE

            sp.student_id = $1

            AND sp.session_id = $2

            AND sp.term_id = $3

        ORDER BY

            sp.payment_date ASC,

            sp.id ASC;

    `;

    const result = await pool.query(

        query,

        [

            studentId,

            sessionId,

            termId

        ]

    );

    return result.rows;

};

const getTotalPaid = async (

    studentId,

    sessionId,

    termId

) => {

    const query = `

        SELECT

            COALESCE(

                SUM(amount_paid),

                0

            ) AS total_paid

        FROM student_payments

        WHERE

            student_id = $1

            AND session_id = $2

            AND term_id = $3;

    `;

    const result = await pool.query(

        query,

        [

            studentId,

            sessionId,

            termId

        ]

    );

    return Number(result.rows[0].total_paid);

};

const updateReceiptNumber = async (
    paymentId,
    receiptNumber,
    client = pool
) => {

    const query = `
        UPDATE student_payments
        SET reference_number = $2
        WHERE id = $1
        RETURNING *;
    `;

    const result = await client.query(
        query,
        [paymentId, receiptNumber]
    );

    return result.rows[0];
};

const getDailyRevenue = async (date) => {

    const query = `

        SELECT

            COALESCE(

                SUM(amount_paid),

                0

            ) AS total

        FROM student_payments

        WHERE payment_date = $1;

    `;

    const result = await pool.query(

        query,

        [date]

    );

    return Number(result.rows[0].total);

};

const getReceiptByNumber = async (receiptNumber) => {

    const query = `

        SELECT

            sp.reference_number,

            sp.payment_date,

            sp.amount_paid,

            sp.payment_method,

            sp.remarks,

            st.admission_number,

            st.first_name,

            st.surname,

            c.class_name,

            t.term_name,

            s.session_name,

            u.username AS received_by

        FROM student_payments sp

        JOIN students st
            ON sp.student_id = st.id

        JOIN classes c
            ON st.class_id = c.id

        JOIN terms t
            ON sp.term_id = t.id

        JOIN academic_sessions s
            ON sp.session_id = s.id

        LEFT JOIN users u
            ON sp.received_by = u.id

        WHERE sp.reference_number = $1;

    `;

    const result = await pool.query(query, [receiptNumber]);

    return result.rows[0];

};

const getPaymentReport = async (filters = {}) => {

    const {
        sessionId,
        termId,
        classId,
        paymentMethod,
        dateFrom,
        dateTo,
        search
    } = filters;


    const conditions = [];
    const values = [];

    let parameterIndex = 1;


    /*
    =====================================
    SESSION FILTER
    =====================================
    */

    if (sessionId) {

        conditions.push(
            `sp.session_id = $${parameterIndex}`
        );

        values.push(sessionId);

        parameterIndex++;

    }


    /*
    =====================================
    TERM FILTER
    =====================================
    */

    if (termId) {

        conditions.push(
            `sp.term_id = $${parameterIndex}`
        );

        values.push(termId);

        parameterIndex++;

    }


    /*
    =====================================
    CLASS FILTER
    =====================================
    */

    if (classId) {

        conditions.push(
            `st.class_id = $${parameterIndex}`
        );

        values.push(classId);

        parameterIndex++;

    }


    /*
    =====================================
    PAYMENT METHOD FILTER
    =====================================
    */

    if (paymentMethod) {

        conditions.push(
            `sp.payment_method = $${parameterIndex}`
        );

        values.push(paymentMethod);

        parameterIndex++;

    }


    /*
    =====================================
    DATE FROM
    =====================================
    */

    if (dateFrom) {

        conditions.push(
            `sp.payment_date >= $${parameterIndex}`
        );

        values.push(dateFrom);

        parameterIndex++;

    }


    /*
    =====================================
    DATE TO
    =====================================
    */

    if (dateTo) {

        conditions.push(
            `sp.payment_date <= $${parameterIndex}`
        );

        values.push(dateTo);

        parameterIndex++;

    }


    /*
    =====================================
    STUDENT SEARCH
    =====================================
    */

    if (search) {

        conditions.push(`

            (
                st.first_name ILIKE $${parameterIndex}

                OR

                st.surname ILIKE $${parameterIndex}

                OR

                st.admission_number ILIKE $${parameterIndex}

            )

        `);

        values.push(`%${search}%`);

        parameterIndex++;

    }


    /*
    =====================================
    WHERE CLAUSE
    =====================================
    */

    const whereClause =

        conditions.length > 0

            ? `WHERE ${conditions.join(" AND ")}`

            : "";


    /*
    =====================================
    PAYMENT REPORT
    =====================================
    */

    const query = `

        SELECT

            sp.id,

            sp.payment_date,

            sp.amount_paid,

            sp.payment_method,

            sp.reference_number,

            sp.remarks,

            st.id AS student_id,

            st.admission_number,

            st.first_name,

            st.surname,

            c.class_name,

            t.term_name,

            s.session_name,

            u.username AS received_by

        FROM student_payments sp

        JOIN students st

            ON sp.student_id = st.id

        JOIN classes c

            ON st.class_id = c.id

        JOIN terms t

            ON sp.term_id = t.id

        JOIN academic_sessions s

            ON sp.session_id = s.id

        LEFT JOIN users u

            ON sp.received_by = u.id

        ${whereClause}

        ORDER BY

            sp.payment_date DESC,

            sp.id DESC;

    `;


    const result = await pool.query(

        query,

        values

    );


    return result.rows;

};


/*
=========================================
PAYMENT REPORT SUMMARY
=========================================
*/

const getPaymentReportSummary = async (filters = {}) => {

    const {
        sessionId,
        termId,
        classId,
        paymentMethod,
        dateFrom,
        dateTo,
        search
    } = filters;


    const conditions = [];
    const values = [];

    let parameterIndex = 1;


    if (sessionId) {

        conditions.push(
            `sp.session_id = $${parameterIndex}`
        );

        values.push(sessionId);

        parameterIndex++;

    }


    if (termId) {

        conditions.push(
            `sp.term_id = $${parameterIndex}`
        );

        values.push(termId);

        parameterIndex++;

    }


    if (classId) {

        conditions.push(
            `st.class_id = $${parameterIndex}`
        );

        values.push(classId);

        parameterIndex++;

    }


    if (paymentMethod) {

        conditions.push(
            `sp.payment_method = $${parameterIndex}`
        );

        values.push(paymentMethod);

        parameterIndex++;

    }


    if (dateFrom) {

        conditions.push(
            `sp.payment_date >= $${parameterIndex}`
        );

        values.push(dateFrom);

        parameterIndex++;

    }


    if (dateTo) {

        conditions.push(
            `sp.payment_date <= $${parameterIndex}`
        );

        values.push(dateTo);

        parameterIndex++;

    }


    if (search) {

        conditions.push(`

            (
                st.first_name ILIKE $${parameterIndex}

                OR

                st.surname ILIKE $${parameterIndex}

                OR

                st.admission_number ILIKE $${parameterIndex}

            )

        `);

        values.push(`%${search}%`);

        parameterIndex++;

    }


    const whereClause =

        conditions.length > 0

            ? `WHERE ${conditions.join(" AND ")}`

            : "";


    const query = `

        SELECT

            COUNT(sp.id) AS transaction_count,

            COUNT(
                DISTINCT sp.student_id
            ) AS student_count,

            COALESCE(
                SUM(sp.amount_paid),
                0
            ) AS total_amount,

            COALESCE(
                SUM(
                    CASE
                        WHEN sp.payment_method = 'CASH'
                        THEN sp.amount_paid
                        ELSE 0
                    END
                ),
                0
            ) AS cash_amount,

            COALESCE(
                SUM(
                    CASE
                        WHEN sp.payment_method = 'BANK_TRANSFER'
                        THEN sp.amount_paid
                        ELSE 0
                    END
                ),
                0
            ) AS transfer_amount,

            COALESCE(
                SUM(
                    CASE
                        WHEN sp.payment_method = 'CARD'
                        THEN sp.amount_paid
                        ELSE 0
                    END
                ),
                0
            ) AS pos_amount,

            COALESCE(
                SUM(
                    CASE
                        WHEN sp.payment_method = 'CARD'
                        THEN sp.amount_paid
                        ELSE 0
                    END
                ),
                0
            ) AS card_amount,

            COALESCE(
                SUM(
                    CASE
                        WHEN sp.payment_method = 'ONLINE'
                        THEN sp.amount_paid
                        ELSE 0
                    END
                ),
                0
            ) AS online_amount

        FROM student_payments sp

        JOIN students st

            ON sp.student_id = st.id

        ${whereClause};

    `;


    const result = await pool.query(

        query,

        values

    );


    return result.rows[0];

};

module.exports = {
    createPayment,
    getStudentPayments,
    getTotalPaid,
    updateReceiptNumber,
    getDailyRevenue,
    getReceiptByNumber,
    getPaymentReport,
    getPaymentReportSummary
}