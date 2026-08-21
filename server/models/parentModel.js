const pool = require("../config/database");

const createParent = async (client, parentData) => {

    const query = `
        INSERT INTO parents (

            id,
            user_id,
            surname,
            first_name,
            middle_name,
            gender,
            phone_number,
            alternate_phone,
            email,
            occupation,
            residential_address

        )

        VALUES (

            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11

        )

        RETURNING *;
    `;

    const values = [

        parentData.id,

        parentData.user_id,

        parentData.surname,

        parentData.first_name,

        parentData.middle_name,

        parentData.gender,

        parentData.phone_number,

        parentData.alternate_phone,

        parentData.email,

        parentData.occupation,

        parentData.residential_address

    ];

    const result = await client.query(query, values);

    return result.rows[0];

};

const linkParentToStudent = async (

    client,

    studentId,

    parentId,

    relationshipId,

    isPrimaryContact

) => {

    const existing = await client.query(

        `
        SELECT id
        FROM student_parents
        WHERE student_id = $1
        AND parent_id = $2
        `,

        [

            studentId,

            parentId

        ]

    );

    if (existing.rows.length > 0) {

        throw new Error(

            "Parent is already linked to this student."

        );

    }

    const query = `
        INSERT INTO student_parents (

            student_id,

            parent_id,

            relationship_id,

            is_primary_contact

        )

        VALUES ($1,$2,$3,$4)

        RETURNING *;
    `;

    const result = await client.query(

        query,

        [

            studentId,

            parentId,

            relationshipId,

            isPrimaryContact

        ]

    );

    return result.rows[0];

};

const getNextParentId = async (client) => {

    const query = `
        SELECT COALESCE(MAX(id), 0) + 1 AS next_id
        FROM parents;
    `;

    const result = await client.query(query);

    return result.rows[0].next_id;

};

const updateParent = async (client, id, parentData) => {

    const query = `
        UPDATE parents
        SET
            surname = $1,
            first_name = $2,
            middle_name = $3,
            gender = $4,
            phone_number = $5,
            alternate_phone = $6,
            email = $7,
            occupation = $8,
            residential_address = $9,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *;
    `;

    const values = [

        parentData.surname,

        parentData.first_name,

        parentData.middle_name,

        parentData.gender,

        parentData.phone_number,

        parentData.alternate_phone,

        parentData.email,

        parentData.occupation,

        parentData.residential_address,

        id

    ];

    const result = await client.query(query, values);

    return result.rows[0];

};

const deleteParent = async (client, id) => {

    const query = `
        DELETE FROM parents
        WHERE id = $1
        RETURNING *;
    `;

    const result = await client.query(query, [id]);

    return result.rows[0];

};

const unlinkParentFromStudent = async (

    client,

    studentId,

    parentId

) => {

    const query = `
        DELETE FROM student_parents
        WHERE student_id = $1
        AND parent_id = $2
        RETURNING *;
    `;

    const result = await client.query(query, [

        studentId,

        parentId

    ]);

    return result.rows[0];

};

const countParentLinks = async (client, parentId) => {

    const query = `
        SELECT COUNT(*)::int AS total
        FROM student_parents
        WHERE parent_id = $1;
    `;

    const result = await client.query(query, [parentId]);

    return result.rows[0].total;

};

const getParentById = async (client, parentId) => {

    const query = `
        SELECT *
        FROM parents
        WHERE id = $1;
    `;

    const result = await client.query(query, [parentId]);

    return result.rows[0];

};

const getParents = async () => {

    const query = `
        SELECT
            p.id,
            p.user_id,
            p.surname,
            p.first_name,
            p.middle_name,
            p.phone_number,
            p.email,
            p.gender
        FROM parents p
        ORDER BY p.surname, p.first_name;
    `;

    const result = await pool.query(query);

    return result.rows;

};

const clearPrimaryContact = async (

    client,

    studentId

) => {

    const query = `
        UPDATE student_parents
        SET is_primary_contact = FALSE
        WHERE student_id = $1;
    `;

    await client.query(query, [studentId]);

};

const updateStudentParent = async (

    client,

    studentId,

    parentId,

    relationshipId,

    isPrimaryContact

) => {

    const query = `
        UPDATE student_parents
        SET

            relationship_id = $1,

            is_primary_contact = $2

        WHERE

            student_id = $3

        AND

            parent_id = $4

        RETURNING *;
    `;

    const result = await client.query(

        query,

        [

            relationshipId,

            isPrimaryContact,

            studentId,

            parentId

        ]

    );

    return result.rows[0];

};

const getParentByUserId = async (userId) => {

    const query = `
        SELECT
            p.id,
            p.user_id,
            p.surname,
            p.first_name,
            p.middle_name,
            p.gender,
            p.phone_number,
            p.alternate_phone,
            p.email,
            p.occupation,
            p.residential_address

        FROM parents p

        WHERE p.user_id = $1;

    `;

    const result =
        await pool.query(
            query,
            [userId]
        );

    return result.rows[0];

};

const getChildrenByParentUserId = async (userId) => {

    const query = `

        SELECT

            s.id,
            s.admission_number,

            s.surname,
            s.first_name,
            s.middle_name,

            CONCAT(
                s.surname,
                ' ',
                s.first_name,
                CASE
                    WHEN s.middle_name IS NOT NULL
                    AND s.middle_name <> ''
                    THEN CONCAT(' ', s.middle_name)
                    ELSE ''
                END
            ) AS student_name,

            se.session_id,
            se.class_id,
            se.arm_id,

            c.class_name,
            a.arm_name,

            se.enrollment_status

        FROM student_parents sp

        JOIN parents p
            ON p.id = sp.parent_id

        JOIN students s
            ON s.id = sp.student_id

        LEFT JOIN student_enrollments se
            ON se.student_id = s.id

        LEFT JOIN classes c
            ON c.id = se.class_id

        LEFT JOIN arms a
            ON a.id = se.arm_id

        WHERE

            p.user_id = $1

            AND se.enrollment_status = 'Active'

        ORDER BY
            s.surname,
            s.first_name;

    `;

    const result =
        await pool.query(
            query,
            [userId]
        );

    return result.rows;

};

const isParentOfStudent = async (
    userId,
    studentId
) => {

    const query = `

        SELECT 1

        FROM student_parents sp

        JOIN parents p
            ON p.id = sp.parent_id

        WHERE
            p.user_id = $1

            AND sp.student_id = $2

        LIMIT 1;

    `;

    const result = await pool.query(
        query,
        [
            userId,
            studentId
        ]
    );

    return result.rowCount > 0;

};


const getParentStudentPaymentSummary = async (
    userId,
    studentId,
    sessionId,
    termId
) => {

    const query = `

        SELECT

            s.id AS student_id,

            s.admission_number,

            s.first_name,

            s.surname,

            c.class_name,

            ses.session_name,

            t.term_name,

            COALESCE(
                (
                    SELECT SUM(fs.amount)

                    FROM fee_structures fs

                    WHERE
                        fs.session_id = $3
                        AND fs.term_id = $4
                        AND fs.class_id = s.class_id
                ),
                0
            ) AS total_fees,

            COALESCE(
                (
                    SELECT SUM(sp.amount_paid)

                    FROM student_payments sp

                    WHERE
                        sp.student_id = s.id
                        AND sp.session_id = $3
                        AND sp.term_id = $4
                ),
                0
            ) AS total_paid

        FROM students s

        JOIN student_parents student_parent
            ON student_parent.student_id = s.id

        JOIN parents p
            ON p.id = student_parent.parent_id

        JOIN classes c
            ON c.id = s.class_id

        JOIN academic_sessions ses
            ON ses.id = $3

        JOIN terms t
            ON t.id = $4

        WHERE
            p.user_id = $1
            AND s.id = $2

        LIMIT 1;

    `;

    const result = await pool.query(
        query,
        [
            userId,
            studentId,
            sessionId,
            termId
        ]
    );

    return result.rows[0];

};


const getParentStudentPayments = async (
    userId,
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

        JOIN student_parents student_parent
            ON student_parent.student_id = sp.student_id

        JOIN parents p
            ON p.id = student_parent.parent_id

        LEFT JOIN users u
            ON u.id = sp.received_by

        WHERE

            p.user_id = $1

            AND sp.student_id = $2

            AND sp.session_id = $3

            AND sp.term_id = $4

        ORDER BY

            sp.payment_date DESC,

            sp.id DESC;

    `;

    const result = await pool.query(
        query,
        [
            userId,
            studentId,
            sessionId,
            termId
        ]
    );

    return result.rows;

};

const getStudentFeeBreakdown = async (studentId) => {

    const query = `

        SELECT

            fs.id,

            ft.fee_name,

            ft.description,

            fs.amount,

            s.session_name,

            t.term_name,

            c.class_name

        FROM student_enrollments se

        JOIN fee_structures fs
            ON fs.session_id = se.session_id

            AND fs.class_id = se.class_id

        JOIN fee_types ft
            ON ft.id = fs.fee_type_id

        JOIN academic_sessions s
            ON s.id = fs.session_id

        JOIN terms t
            ON t.id = fs.term_id

        JOIN classes c
            ON c.id = fs.class_id

        WHERE

            se.student_id = $1

            AND se.enrollment_status = 'Active'

        ORDER BY

            t.id,

            ft.fee_name;

    `;

    const result = await pool.query(
        query,
        [studentId]
    );

    return result.rows;

};

const getParentFinancialOverview = async (
    sessionId,
    termId
) => {

    const query = `

        WITH current_fees AS (

            SELECT
                se.student_id,

                COALESCE(
                    SUM(fs.amount),
                    0
                ) AS current_term_fees

            FROM student_enrollments se

            LEFT JOIN fee_structures fs
                ON fs.session_id = se.session_id
                AND fs.term_id = $2
                AND fs.class_id = se.class_id

            WHERE
                se.session_id = $1
                AND se.enrollment_status = 'Active'

            GROUP BY
                se.student_id
        ),

        current_payments AS (

            SELECT
                sp.student_id,

                COALESCE(
                    SUM(sp.amount_paid),
                    0
                ) AS current_term_paid

            FROM student_payments sp

            WHERE
                sp.session_id = $1
                AND sp.term_id = $2

            GROUP BY
                sp.student_id
        ),

        previous_term AS (

            SELECT
                t.id AS term_id,
                t.session_id,

                LAG(t.id) OVER (
                    PARTITION BY t.session_id
                    ORDER BY t.start_date
                ) AS previous_term_id

            FROM terms t

            WHERE
                t.session_id = $1
        ),

        previous_fees AS (

            SELECT
                se.student_id,

                COALESCE(
                    SUM(fs.amount),
                    0
                ) AS previous_term_fees

            FROM student_enrollments se

            JOIN previous_term pt
                ON pt.session_id = se.session_id

            LEFT JOIN fee_structures fs
                ON fs.session_id = se.session_id
                AND fs.term_id = pt.previous_term_id
                AND fs.class_id = se.class_id

            WHERE
                se.session_id = $1
                AND se.enrollment_status = 'Active'
                AND pt.term_id = $2

            GROUP BY
                se.student_id
        ),

        previous_payments AS (

            SELECT
                sp.student_id,

                COALESCE(
                    SUM(sp.amount_paid),
                    0
                ) AS previous_term_paid

            FROM student_payments sp

            JOIN previous_term pt
                ON pt.session_id = sp.session_id
                AND pt.previous_term_id = sp.term_id

            WHERE
                sp.session_id = $1
                AND pt.term_id = $2

            GROUP BY
                sp.student_id
        ),

        student_financials AS (

            SELECT

                s.id AS student_id,

                COALESCE(
                    cf.current_term_fees,
                    0
                ) AS current_term_fees,

                COALESCE(
                    cp.current_term_paid,
                    0
                ) AS current_term_paid,

                GREATEST(
                    COALESCE(pf.previous_term_fees, 0)
                    -
                    COALESCE(pp.previous_term_paid, 0),
                    0
                ) AS previous_balance

            FROM students s

            LEFT JOIN current_fees cf
                ON cf.student_id = s.id

            LEFT JOIN current_payments cp
                ON cp.student_id = s.id

            LEFT JOIN previous_fees pf
                ON pf.student_id = s.id

            LEFT JOIN previous_payments pp
                ON pp.student_id = s.id

            JOIN student_enrollments se
                ON se.student_id = s.id

            WHERE
                se.session_id = $1
                AND se.enrollment_status = 'Active'
        )

        SELECT

            p.id AS parent_id,

            p.surname,

            p.first_name,

            p.middle_name,

            p.phone_number,

            p.email,

            COUNT(
                DISTINCT sp.student_id
            ) AS number_of_children,

            COALESCE(
                SUM(sf.current_term_fees),
                0
            ) AS current_term_fees,

            COALESCE(
                SUM(sf.previous_balance),
                0
            ) AS previous_balance,

            COALESCE(
                SUM(
                    sf.current_term_fees
                    +
                    sf.previous_balance
                ),
                0
            ) AS total_expected,

            COALESCE(
                SUM(sf.current_term_paid),
                0
            ) AS total_paid,

            GREATEST(
                COALESCE(
                    SUM(
                        sf.current_term_fees
                        +
                        sf.previous_balance
                        -
                        sf.current_term_paid
                    ),
                    0
                ),
                0
            ) AS outstanding

        FROM parents p

        JOIN student_parents sp
            ON sp.parent_id = p.id

        JOIN student_financials sf
            ON sf.student_id = sp.student_id

        GROUP BY

            p.id,
            p.surname,
            p.first_name,
            p.middle_name,
            p.phone_number,
            p.email

        ORDER BY

            outstanding DESC,

            p.surname ASC,

            p.first_name ASC;

    `;

    const result = await pool.query(
        query,
        [
            sessionId,
            termId
        ]
    );

    return result.rows;
};

const getParentFinancialDetails = async (
    parentId,
    sessionId,
    termId
) => {

    const query = `

        WITH current_fees AS (

            SELECT
                se.student_id,

                COALESCE(
                    SUM(fs.amount),
                    0
                ) AS current_term_fees

            FROM student_enrollments se

            LEFT JOIN fee_structures fs
                ON fs.session_id = se.session_id
                AND fs.term_id = $3
                AND fs.class_id = se.class_id

            WHERE
                se.session_id = $2
                AND se.enrollment_status = 'Active'

            GROUP BY
                se.student_id
        ),

        current_payments AS (

            SELECT
                sp.student_id,

                COALESCE(
                    SUM(sp.amount_paid),
                    0
                ) AS current_term_paid

            FROM student_payments sp

            WHERE
                sp.session_id = $2
                AND sp.term_id = $3

            GROUP BY
                sp.student_id
        ),

        previous_term AS (

            SELECT
                t.id AS term_id,

                LAG(t.id) OVER (
                    PARTITION BY t.session_id
                    ORDER BY t.start_date
                ) AS previous_term_id

            FROM terms t

            WHERE
                t.session_id = $2
        ),

        previous_fees AS (

            SELECT
                se.student_id,

                COALESCE(
                    SUM(fs.amount),
                    0
                ) AS previous_term_fees

            FROM student_enrollments se

            JOIN previous_term pt
                ON pt.term_id = $3

            LEFT JOIN fee_structures fs
                ON fs.session_id = se.session_id
                AND fs.term_id = pt.previous_term_id
                AND fs.class_id = se.class_id

            WHERE
                se.session_id = $2
                AND se.enrollment_status = 'Active'

            GROUP BY
                se.student_id
        ),

        previous_payments AS (

            SELECT
                sp.student_id,

                COALESCE(
                    SUM(sp.amount_paid),
                    0
                ) AS previous_term_paid

            FROM student_payments sp

            JOIN previous_term pt
                ON pt.previous_term_id = sp.term_id

            WHERE
                sp.session_id = $2
                AND pt.term_id = $3

            GROUP BY
                sp.student_id
        )

        SELECT

            p.id AS parent_id,

            p.surname AS parent_surname,

            p.first_name AS parent_first_name,

            p.middle_name AS parent_middle_name,

            p.phone_number,

            p.email,

            s.id AS student_id,

            s.admission_number,

            s.surname AS student_surname,

            s.first_name AS student_first_name,

            s.middle_name AS student_middle_name,

            c.class_name,

            a.arm_name,

            COALESCE(
                cf.current_term_fees,
                0
            ) AS current_term_fees,

            GREATEST(

                COALESCE(pf.previous_term_fees, 0)

                -

                COALESCE(pp.previous_term_paid, 0),

                0

            ) AS previous_balance,

            COALESCE(
                cp.current_term_paid,
                0
            ) AS total_paid,

            GREATEST(

                COALESCE(cf.current_term_fees, 0)

                +

                GREATEST(

                    COALESCE(pf.previous_term_fees, 0)

                    -

                    COALESCE(pp.previous_term_paid, 0),

                    0

                )

                -

                COALESCE(cp.current_term_paid, 0),

                0

            ) AS outstanding

        FROM parents p

        JOIN student_parents sp
            ON sp.parent_id = p.id

        JOIN students s
            ON s.id = sp.student_id

        JOIN student_enrollments se
            ON se.student_id = s.id

        LEFT JOIN classes c
            ON c.id = se.class_id

        LEFT JOIN arms a
            ON a.id = se.arm_id

        LEFT JOIN current_fees cf
            ON cf.student_id = s.id

        LEFT JOIN current_payments cp
            ON cp.student_id = s.id

        LEFT JOIN previous_fees pf
            ON pf.student_id = s.id

        LEFT JOIN previous_payments pp
            ON pp.student_id = s.id

        WHERE

            p.id = $1

            AND se.session_id = $2

            AND se.enrollment_status = 'Active'

        ORDER BY

            s.surname,

            s.first_name;

    `;

    const result = await pool.query(
        query,
        [
            parentId,
            sessionId,
            termId
        ]
    );

    return result.rows;
};



module.exports = {
    createParent,
    linkParentToStudent,
    getNextParentId,
    updateParent,
    deleteParent,
    unlinkParentFromStudent,
    countParentLinks,
    getParentById,
    getParents, 
    clearPrimaryContact,
    updateStudentParent,
    getParentByUserId,
    getChildrenByParentUserId,
    isParentOfStudent,
    getParentStudentPaymentSummary,
    getParentStudentPayments,
    getStudentFeeBreakdown,
    getParentFinancialOverview,
    getParentFinancialDetails
}