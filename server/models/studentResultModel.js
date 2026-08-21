const pool = require("../config/database");

const createResult = async (data, client = pool) => {

    const query = `
        INSERT INTO student_results (

            student_id,

            teacher_assignment_id,

            session_id,

            term_id,

            ca_score,

            exam_score,

            total_score,

            grade,

            remark

        )

        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)

        RETURNING *;
    `;

    const values = [

        data.student_id,

        data.teacher_assignment_id,

        data.session_id,

        data.term_id,

        data.ca_score,

        data.exam_score,

        data.total_score,

        data.grade,

        data.remark

    ];

    const result = await client.query(query, values);

    return result.rows[0];

};

const getResultById = async (id) => {

    const query = `
        SELECT

            sr.id,

            s.admission_number,

            CONCAT(
                s.surname,
                ' ',
                s.first_name
            ) AS student_name,

            sub.subject_name,

            c.class_name,

            a.arm_name,

            ac.session_name,

            t.term_name,

            sr.ca_score,

            sr.exam_score,

            sr.total_score,

            sr.grade,

            sr.remark

        FROM student_results sr

        JOIN students s
            ON s.id = sr.student_id

        JOIN teacher_assignments ta
            ON ta.id = sr.teacher_assignment_id

        JOIN subjects sub
            ON sub.id = ta.subject_id

        JOIN classes c
            ON c.id = ta.class_id

        LEFT JOIN arms a
            ON a.id = ta.arm_id

        JOIN academic_sessions ac
            ON ac.id = sr.session_id

        JOIN terms t
            ON t.id = sr.term_id

        WHERE sr.id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];

};

const getExistingResult = async (
    studentId,
    teacherAssignmentId,
    sessionId,
    termId,
    client = pool
) => {

    const query = `

        SELECT *

        FROM student_results

        WHERE

            student_id = $1

            AND teacher_assignment_id = $2

            AND session_id = $3

            AND term_id = $4

        LIMIT 1;

    `;

    const result = await client.query(

        query,

        [

            studentId,

            teacherAssignmentId,

            sessionId,

            termId

        ]

    );

    return result.rows[0];

};

const updateResult = async (
    id,
    data,
    client = pool
) => {

    const query = `

        UPDATE student_results

        SET

            ca_score = $1,

            exam_score = $2,

            total_score = $3,

            grade = $4,

            remark = $5,

            updated_at = CURRENT_TIMESTAMP

        WHERE id = $6

        RETURNING *;

    `;

    const values = [

        data.ca_score,

        data.exam_score,

        data.total_score,

        data.grade,

        data.remark,

        id

    ];

    const result = await client.query(query, values);

    return result.rows[0];

};

const getStudentsForResultEntry = async (
    teacherAssignmentId
) => {

    const query = `

        SELECT

            s.id,

            s.admission_number,

            CONCAT(
                s.surname,
                ' ',
                s.first_name,

                CASE

                    WHEN s.middle_name IS NOT NULL
                        AND s.middle_name <> ''

                    THEN ' ' || s.middle_name

                    ELSE ''

                END

            ) AS student_name,

            sr.id AS result_id,

            sr.ca_score,

            sr.exam_score,

            sr.total_score,

            sr.grade,

            sr.remark,

            sr.position

        FROM students s

        JOIN student_enrollments se
            ON se.student_id = s.id

        JOIN teacher_assignments ta
            ON ta.class_id = se.class_id

            AND ta.arm_id = se.arm_id

            AND ta.session_id = se.session_id

        LEFT JOIN student_results sr
            ON sr.student_id = s.id

            AND sr.teacher_assignment_id = ta.id

            AND sr.session_id = ta.session_id

            AND sr.term_id = ta.term_id

        WHERE ta.id = $1

        AND se.enrollment_status = 'Active'

        ORDER BY

            s.surname,

            s.first_name;

    `;

    const result = await pool.query(

        query,

        [teacherAssignmentId]

    );

    return result.rows;

};

const updatePositions = async (
    teacherAssignmentId,
    sessionId,
    termId,
    client = pool
) => {

    const query = `

        WITH ranked AS (

            SELECT

                id,

                DENSE_RANK() OVER (

                    ORDER BY total_score DESC

                ) AS position

            FROM student_results

            WHERE

                teacher_assignment_id = $1

                AND session_id = $2

                AND term_id = $3

        )

        UPDATE student_results sr

        SET position = ranked.position

        FROM ranked

        WHERE sr.id = ranked.id

        RETURNING

            sr.id,

            sr.student_id,

            sr.total_score,

            sr.position;

    `;

    const result = await client.query(
        query,
        [
            teacherAssignmentId,
            sessionId,
            termId
        ]
    );

    return result.rows;

};

const getStudentResultReport = async (
    studentId,
    sessionId,
    termId
) => {

    const query = `

        SELECT

            s.id AS student_id,

            s.admission_number,

            se.class_id,

            se.arm_id,

            CONCAT(
                s.surname,
                ' ',
                s.first_name,
                CASE
                    WHEN s.middle_name IS NOT NULL
                        AND s.middle_name <> ''
                    THEN ' ' || s.middle_name
                    ELSE ''
                END
            ) AS student_name,

            c.class_name,

            a.arm_name,

            ac.session_name,

            t.term_name,

            sub.subject_name,

            sr.ca_score,

            sr.exam_score,

            sr.total_score,

            sr.grade,

            sr.remark,

            sr.position

        FROM student_results sr

        JOIN students s
            ON sr.student_id = s.id

        JOIN teacher_assignments ta
            ON sr.teacher_assignment_id = ta.id

        JOIN subjects sub
            ON ta.subject_id = sub.id

        JOIN student_enrollments se
            ON se.student_id = s.id
            AND se.session_id = sr.session_id
            AND se.class_id = ta.class_id
            AND (
                se.arm_id = ta.arm_id
                OR (
                    se.arm_id IS NULL
                    AND ta.arm_id IS NULL
                )
            )

        JOIN classes c
            ON se.class_id = c.id

        LEFT JOIN arms a
            ON se.arm_id = a.id

        JOIN academic_sessions ac
            ON sr.session_id = ac.id

        JOIN terms t
            ON sr.term_id = t.id

        WHERE

            sr.student_id = $1

            AND sr.session_id = $2

            AND sr.term_id = $3

        ORDER BY

            sub.subject_name;

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

const getOverallClassRankings = async (
    classId,
    armId,
    sessionId,
    termId
) => {

    const query = `

        WITH student_totals AS (

            SELECT

                sr.student_id,

                SUM(sr.total_score) AS total_score,

                COUNT(sr.id) AS number_of_subjects,

                ROUND(
                    AVG(sr.total_score),
                    2
                ) AS average_score

            FROM student_results sr

            JOIN teacher_assignments ta
                ON sr.teacher_assignment_id = ta.id

            JOIN student_enrollments se
                ON se.student_id = sr.student_id

                AND se.session_id = sr.session_id

                AND se.class_id = ta.class_id

                AND (
                    se.arm_id = ta.arm_id

                    OR (

                        se.arm_id IS NULL

                        AND ta.arm_id IS NULL

                    )

                )

            WHERE

                ta.class_id = $1

                AND (

                    ta.arm_id = $2

                    OR (

                        ta.arm_id IS NULL

                        AND $2 IS NULL

                    )

                )

                AND sr.session_id = $3

                AND sr.term_id = $4

                AND se.enrollment_status = 'Active'

            GROUP BY

                sr.student_id

        )

        SELECT

            student_id,

            total_score,

            number_of_subjects,

            average_score,

            DENSE_RANK() OVER (

                ORDER BY

                    average_score DESC,

                    total_score DESC

            ) AS overall_position

        FROM student_totals

        ORDER BY

            overall_position,

            student_id;

    `;

    const result = await pool.query(

        query,

        [

            classId,

            armId,

            sessionId,

            termId

        ]

    );

    return result.rows;

};

const getClassResultSheet = async (
    classId,
    armId,
    sessionId,
    termId
) => {

    const query = `

        WITH student_totals AS (

            SELECT

                s.id AS student_id,

                s.admission_number,

                CONCAT(
                    s.surname,
                    ' ',
                    s.first_name,
                    CASE
                        WHEN s.middle_name IS NOT NULL
                            AND s.middle_name <> ''
                        THEN ' ' || s.middle_name
                        ELSE ''
                    END
                ) AS student_name,

                COUNT(sr.id) AS number_of_subjects,

                SUM(sr.total_score) AS total_score,

                ROUND(
                    AVG(sr.total_score),
                    2
                ) AS average_score

            FROM students s

            JOIN student_enrollments se
                ON se.student_id = s.id

            LEFT JOIN student_results sr
                ON sr.student_id = s.id
                AND sr.session_id = $3
                AND sr.term_id = $4

            LEFT JOIN teacher_assignments ta
                ON ta.id = sr.teacher_assignment_id
                AND ta.class_id = $1
                AND (
                    ta.arm_id = $2
                    OR (
                        ta.arm_id IS NULL
                        AND $2 IS NULL
                    )
                )

            WHERE

                se.class_id = $1

                AND (
                    se.arm_id = $2
                    OR (
                        se.arm_id IS NULL
                        AND $2 IS NULL
                    )
                )

                AND se.session_id = $3

                AND se.enrollment_status = 'Active'

            GROUP BY

                s.id,

                s.admission_number,

                s.surname,

                s.first_name,

                s.middle_name

        ),

        ranked_students AS (

            SELECT

                *,

                DENSE_RANK() OVER (

                    ORDER BY

                        average_score DESC NULLS LAST,

                        total_score DESC NULLS LAST

                ) AS overall_position

            FROM student_totals

        )

        SELECT

            *

        FROM ranked_students

        ORDER BY

            overall_position,

            student_name;

    `;

    const result = await pool.query(

        query,

        [

            classId,

            armId,

            sessionId,

            termId

        ]

    );

    return result.rows;

};

const getClassBroadsheet = async (
    classId,
    armId,
    sessionId,
    termId
) => {

    const query = `

        SELECT

            s.id AS student_id,

            s.admission_number,

            CONCAT(
                s.surname,
                ' ',
                s.first_name,
                CASE
                    WHEN s.middle_name IS NOT NULL
                        AND s.middle_name <> ''
                    THEN ' ' || s.middle_name
                    ELSE ''
                END
            ) AS student_name,

            sub.id AS subject_id,

            sub.subject_name,

            sr.total_score

        FROM student_results sr

        JOIN students s
            ON s.id = sr.student_id

        JOIN teacher_assignments ta
            ON ta.id = sr.teacher_assignment_id

        JOIN subjects sub
            ON sub.id = ta.subject_id

        JOIN student_enrollments se
            ON se.student_id = s.id

            AND se.class_id = ta.class_id

            AND se.session_id = sr.session_id

            AND (
                se.arm_id = ta.arm_id

                OR (

                    se.arm_id IS NULL

                    AND ta.arm_id IS NULL

                )

            )

        WHERE

            ta.class_id = $1

            AND (

                ta.arm_id = $2

                OR (

                    ta.arm_id IS NULL

                    AND $2 IS NULL

                )

            )

            AND sr.session_id = $3

            AND sr.term_id = $4

            AND se.enrollment_status = 'Active'

        ORDER BY

            s.surname,

            s.first_name,

            sub.subject_name;

    `;

    const result = await pool.query(

        query,

        [

            classId,

            armId || null,

            sessionId,

            termId

        ]

    );

    return result.rows;

};

module.exports = {

    createResult,
    getResultById,
    getExistingResult,
    updateResult,
    getStudentsForResultEntry,
    updatePositions,
    getStudentResultReport,
    getOverallClassRankings,
    getClassResultSheet,
    getClassBroadsheet

};