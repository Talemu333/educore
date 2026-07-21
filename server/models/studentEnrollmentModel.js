const enrollmentExists = async (

    studentId,

    sessionId

) => {

    const query = `

        SELECT 1

        FROM student_enrollments

        WHERE

            student_id = $1

            AND

            session_id = $2

        LIMIT 1;

    `;

    const result = await pool.query(

        query,

        [

            studentId,

            sessionId

        ]

    );

    return result.rowCount > 0;

};

const createEnrollment = async (
    data,
    client = pool
) => {

    const query = `

        INSERT INTO student_enrollments(

            student_id,

            session_id,

            class_id,

            arm_id,

            enrollment_status

        )

        VALUES($1,$2,$3,$4,$5)

        RETURNING *;

    `;

    const values = [

        data.student_id,

        data.session_id,

        data.class_id,

        data.arm_id,

        data.enrollment_status

    ];

    const result =
        await client.query(query, values);

    return result.rows[0];

};

module.exports = {
    enrollmentExists,
    createEnrollment
}