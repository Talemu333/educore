const pool = require("../config/database");


/*
=========================================
GET CURRENT ACADEMIC SESSION
=========================================
*/

const getCurrentSession = async () => {

    const query = `

        SELECT
            id,
            session_name,
            start_date,
            end_date,
            is_current

        FROM academic_sessions

        WHERE is_current = TRUE

        LIMIT 1;

    `;


    const result =
        await pool.query(query);


    return result.rows[0];

};


/*
=========================================
GET NEXT ACADEMIC SESSION
=========================================
*/

const getNextSession = async (
    currentSessionId
) => {

    const query = `

        SELECT
            id,
            session_name,
            start_date,
            end_date,
            is_current

        FROM academic_sessions

        WHERE id > $1

        ORDER BY
            start_date ASC,
            id ASC

        LIMIT 1;

    `;


    const result =
        await pool.query(

            query,

            [
                currentSessionId
            ]

        );


    return result.rows[0];

};


/*
=========================================
GET CLASSES
=========================================
*/

const getClasses = async () => {

    const query = `

        SELECT
            id,
            class_name,
            class_level,
            sort_order

        FROM classes

        ORDER BY
            sort_order ASC,
            id ASC;

    `;


    const result =
        await pool.query(query);


    return result.rows;

};


/*
=========================================
GET ARMS FOR CLASS
=========================================
*/

const getArmsByClass = async (
    classId
) => {

    const query = `

        SELECT
            id,
            arm_name,
            class_id

        FROM arms

        WHERE class_id = $1

        ORDER BY
            arm_name ASC;

    `;


    const result =
        await pool.query(

            query,

            [
                classId
            ]

        );


    return result.rows;

};


/*
=========================================
GET STUDENTS ELIGIBLE FOR PROMOTION
=========================================
*/

const getStudentsForPromotion = async ({
    sessionId,
    classId,
    armId
}) => {

    const values = [

        sessionId,

        classId

    ];


    let armCondition = "";


    /*
    =========================================
    OPTIONAL ARM FILTER
    =========================================
    */

    if (armId) {

        values.push(armId);


        armCondition = `

            AND se.arm_id = $3

        `;

    }


    const query = `

        SELECT

            s.id AS student_id,

            s.admission_number,

            s.surname,

            s.first_name,

            s.middle_name,

            s.gender,

            s.status AS student_status,

            se.id AS enrollment_id,

            se.session_id,

            se.class_id,

            se.arm_id,

            se.enrollment_status,

            c.class_name,

            c.class_level,

            c.sort_order AS class_sort_order,

            a.arm_name

        FROM student_enrollments se

        INNER JOIN students s
            ON s.id = se.student_id

        INNER JOIN classes c
            ON c.id = se.class_id

        LEFT JOIN arms a
            ON a.id = se.arm_id

        WHERE

            se.session_id = $1

            AND se.class_id = $2

            ${armCondition}

            AND LOWER(
                COALESCE(
                    se.enrollment_status,
                    'active'
                )
            ) = 'active'

            AND LOWER(
                COALESCE(
                    s.status,
                    'active'
                )
            ) = 'active'

        ORDER BY

            s.surname ASC,

            s.first_name ASC,

            s.middle_name ASC;

    `;


    const result =
        await pool.query(

            query,

            values

        );


    return result.rows;

};


/*
=========================================
PROCESS STUDENT DECISIONS
=========================================

SUPPORTED ACTIONS:

1. Promoted
2. Repeated
3. Graduated


PROMOTED:

Current session
      ↓
Next session

Current class
      ↓
Higher class


REPEATED:

Current session
      ↓
Next session

Current class
      ↓
Same class


GRADUATED:

Only SS3 students.

Current session
      ↓
No next enrollment

Current enrollment
      ↓
Graduated

Student profile
      ↓
Graduated


IMPORTANT:

SS3 students cannot be promoted.

They must be graduated.
=========================================
*/

const processStudentDecisions = async ({
    students,
    currentSessionId,
    nextSessionId,
    destinationClassId,
    defaultArmId,
    processedBy
}) => {

    const client =
        await pool.connect();


    try {

        await client.query(
            "BEGIN"
        );


        /*
        =========================================
        VALIDATE INPUT
        =========================================
        */

        if (
            !Array.isArray(students) ||
            students.length === 0
        ) {

            throw new Error(
                "At least one student must be selected."
            );

        }


        /*
        =========================================
        VERIFY CURRENT SESSION
        =========================================
        */

        const currentSessionResult =
            await client.query(

                `

                SELECT

                    id,

                    session_name,

                    start_date,

                    end_date,

                    is_current

                FROM academic_sessions

                WHERE id = $1

                LIMIT 1;

                `,

                [
                    currentSessionId
                ]

            );


        if (
            currentSessionResult.rows.length === 0
        ) {

            throw new Error(
                "Current academic session does not exist."
            );

        }


        const currentSession =
            currentSessionResult.rows[0];


        /*
        =========================================
        DETERMINE REQUIRED ACTIONS
        =========================================
        */

        const normalizedStudents =
            students.map(
                student => ({

                    ...student,

                    action:
                        String(
                            student.action ||
                            "Promoted"
                        ).trim()

                })
            );


        /*
        =========================================
        VALIDATE ACTIONS
        =========================================
        */

        for (
            const student
            of normalizedStudents
        ) {

            if (
                ![
                    "Promoted",
                    "Repeated",
                    "Graduated"
                ].includes(
                    student.action
                )
            ) {

                throw new Error(

                    `Invalid promotion action for student ${student.studentId}.`

                );

            }

        }


        /*
        =========================================
        DETERMINE WHETHER NEXT SESSION IS NEEDED
        =========================================
        */

        const hasNonGraduatingStudents =
            normalizedStudents.some(

                student =>
                    student.action !==
                    "Graduated"

            );


        /*
        =========================================
        VERIFY NEXT SESSION
        =========================================

        Only Promoted and Repeated students
        require the next academic session.

        Graduated students do not.
        =========================================
        */

        let nextSession = null;


        if (
            hasNonGraduatingStudents
        ) {

            if (
                !nextSessionId
            ) {

                throw new Error(

                    "There is no next academic session available for promotion or repetition."

                );

            }


            const nextSessionResult =
                await client.query(

                    `

                    SELECT

                        id,

                        session_name,

                        start_date,

                        end_date,

                        is_current

                    FROM academic_sessions

                    WHERE id = $1

                    LIMIT 1;

                    `,

                    [
                        nextSessionId
                    ]

                );


            if (
                nextSessionResult.rows.length === 0
            ) {

                throw new Error(

                    "Destination academic session does not exist."

                );

            }


            nextSession =
                nextSessionResult.rows[0];

        }


        /*
        =========================================
        VERIFY DESTINATION CLASS
        =========================================

        Only promoted students require a
        destination class.

        Repeaters remain in their current class.

        Graduated students do not need one.
        =========================================
        */

        const hasPromotedStudents =
            normalizedStudents.some(

                student =>
                    student.action ===
                    "Promoted"

            );


        let destinationClass = null;


        if (
            hasPromotedStudents
        ) {

            if (
                !destinationClassId
            ) {

                throw new Error(

                    "Destination class is required for promoted students."

                );

            }


            const destinationClassResult =
                await client.query(

                    `

                    SELECT

                        id,

                        class_name,

                        class_level,

                        sort_order

                    FROM classes

                    WHERE id = $1

                    LIMIT 1;

                    `,

                    [
                        destinationClassId
                    ]

                );


            if (
                destinationClassResult.rows.length === 0
            ) {

                throw new Error(

                    "Destination class does not exist."

                );

            }


            destinationClass =
                destinationClassResult.rows[0];

        }


        /*
        =========================================
        PREPARE RESULTS
        =========================================
        */

        const processedStudents = [];


        /*
        =========================================
        PROCESS EACH STUDENT
        =========================================
        */

        for (
            const student
            of normalizedStudents
        ) {

            /*
            -------------------------------------
            STUDENT ID
            -------------------------------------
            */

            const studentId =
                Number(
                    student.studentId
                );


            if (
                !studentId ||
                Number.isNaN(studentId)
            ) {

                throw new Error(

                    "Invalid student ID supplied."

                );

            }


            const action =
                student.action;


            /*
            =====================================
            GET CURRENT ENROLLMENT
            =====================================
            */

                    const enrollmentResult =
            await client.query(

                `
                SELECT

                    se.id,

                    se.student_id,

                    se.session_id,

                    se.class_id,

                    se.arm_id,

                    se.enrollment_status,

                    c.class_name,

                    c.class_level,

                    c.sort_order AS class_sort_order,

                    a.arm_name

                FROM student_enrollments se

                INNER JOIN classes c
                    ON c.id = se.class_id

                LEFT JOIN arms a
                    ON a.id = se.arm_id

                WHERE

                    se.student_id = $1

                    AND se.session_id = $2

                FOR UPDATE OF se;

                `,

                [
                    studentId,
                    currentSessionId
                ]

            );


            if (
                enrollmentResult.rows.length === 0
            ) {

                throw new Error(

                    `Student ${studentId} does not have an enrollment in the current academic session.`

                );

            }


            const currentEnrollment =
                enrollmentResult.rows[0];


            /*
            =====================================
            VERIFY CURRENT ENROLLMENT
            =====================================
            */

            if (
                String(
                    currentEnrollment.enrollment_status
                ).toLowerCase() !== "active"
            ) {

                throw new Error(

                    `Student ${studentId} does not have an active enrollment.`

                );

            }


            /*
            =====================================
            GRADUATION
            =====================================
            */

            if (
                action === "Graduated"
            ) {

                /*
                ---------------------------------
                ONLY SS3 CAN GRADUATE
                ---------------------------------
                */

                if (
                    String(
                        currentEnrollment.class_name
                    ).trim().toUpperCase() !==
                    "SS3"
                ) {

                    throw new Error(

                        `Student ${studentId} cannot graduate because the student is currently in ${currentEnrollment.class_name}. Only SS3 students can graduate.`

                    );

                }


                /*
                ---------------------------------
                CHECK DUPLICATE GRADUATION
                ---------------------------------
                */

                const existingHistoryResult =
                    await client.query(

                        `

                        SELECT

                            id

                        FROM student_promotion_history

                        WHERE

                            student_id = $1

                            AND from_session_id = $2

                            AND action = 'Graduated'

                        LIMIT 1;

                        `,

                        [

                            studentId,

                            currentSessionId

                        ]

                    );


                if (
                    existingHistoryResult.rows.length > 0
                ) {

                    throw new Error(

                        `Student ${studentId} has already been processed for graduation in ${currentSession.session_name}.`

                    );

                }


                /*
                ---------------------------------
                RECORD GRADUATION HISTORY
                ---------------------------------
                */

                await client.query(

                    `

                    INSERT INTO student_promotion_history
                    (

                        student_id,

                        from_session_id,
                        to_session_id,

                        from_class_id,
                        to_class_id,

                        from_arm_id,
                        to_arm_id,

                        action,

                        remarks,

                        processed_by

                    )

                    VALUES
                    (

                        $1,

                        $2,
                        NULL,

                        $3,
                        NULL,

                        $4,
                        NULL,

                        'Graduated',

                        $5,

                        $6

                    );

                    `,

                    [

                        studentId,

                        currentSessionId,

                        currentEnrollment.class_id,

                        currentEnrollment.arm_id,

                        `Student graduated from SS3 in the ${currentSession.session_name} academic session.`,

                        processedBy || null

                    ]

                );


                /*
                ---------------------------------
                MARK CURRENT ENROLLMENT GRADUATED
                ---------------------------------
                */

                await client.query(

                    `

                    UPDATE student_enrollments

                    SET

                        enrollment_status =
                            'Graduated',

                        updated_at =
                            CURRENT_TIMESTAMP

                    WHERE id = $1;

                    `,

                    [

                        currentEnrollment.id

                    ]

                );


                /*
                ---------------------------------
                UPDATE STUDENT PROFILE
                ---------------------------------
                */

                await client.query(

                    `

                    UPDATE students

                    SET

                        status = 'Graduated',

                        updated_at =
                            CURRENT_TIMESTAMP

                    WHERE id = $1;

                    `,

                    [

                        studentId

                    ]

                );


                /*
                ---------------------------------
                RETURN RESULT
                ---------------------------------
                */

                processedStudents.push({

                    studentId,

                    action:
                        "Graduated",

                    fromSession:
                        currentSession.session_name,

                    toSession:
                        null,

                    fromClass:
                        currentEnrollment.class_name,

                    toClass:
                        null,

                    fromArm:
                        currentEnrollment.arm_name,

                    toArm:
                        null

                });


                continue;

            }


            /*
            =====================================
            PROMOTION
            =====================================
            */

            if (
                action === "Promoted"
            ) {

                /*
                ---------------------------------
                SS3 CANNOT BE PROMOTED
                ---------------------------------
                */

                if (
                    String(
                        currentEnrollment.class_name
                    ).trim().toUpperCase() ===
                    "SS3"
                ) {

                    throw new Error(

                        `Student ${studentId} is in SS3 and cannot be promoted. Select "Graduated" instead.`

                    );

                }


                /*
                ---------------------------------
                DESTINATION CLASS MUST BE HIGHER
                ---------------------------------
                */

                if (
                    Number(
                        destinationClass.sort_order
                    ) <=
                    Number(
                        currentEnrollment.class_sort_order
                    )
                ) {

                    throw new Error(

                        `Student ${studentId} cannot be promoted from ${currentEnrollment.class_name} to ${destinationClass.class_name}. The destination class must be higher than the current class.`

                    );

                }

            }


            /*
            =====================================
            DETERMINE TARGET CLASS
            =====================================
            */

            let targetClassId =
                destinationClassId;


            /*
            -------------------------------------
            REPEATER REMAINS IN SAME CLASS
            -------------------------------------
            */

            if (
                action === "Repeated"
            ) {

                targetClassId =
                    currentEnrollment.class_id;

            }


            /*
            =====================================
            NEXT SESSION MUST EXIST
            =====================================
            */

            if (
                !nextSession
            ) {

                throw new Error(

                    `Student ${studentId} cannot be processed because there is no destination academic session.`

                );

            }


            /*
            =====================================
            DETERMINE TARGET ARM
            =====================================
            */

            const targetArmId =
                student.armId ||
                defaultArmId ||
                currentEnrollment.arm_id ||
                null;


            /*
            =====================================
            VERIFY TARGET ARM
            =====================================
            */

            if (
                targetArmId
            ) {

                const targetArmResult =
                    await client.query(

                        `

                        SELECT

                            id,

                            arm_name,

                            class_id

                        FROM arms

                        WHERE id = $1

                        LIMIT 1;

                        `,

                        [
                            targetArmId
                        ]

                    );


                if (
                    targetArmResult.rows.length === 0
                ) {

                    throw new Error(

                        `Selected arm ${targetArmId} does not exist.`

                    );

                }


                const targetArm =
                    targetArmResult.rows[0];


                /*
                ---------------------------------
                ARM MUST BELONG TO TARGET CLASS
                ---------------------------------
                */

                if (
                    Number(
                        targetArm.class_id
                    ) !==
                    Number(
                        targetClassId
                    )
                ) {

                    throw new Error(

                        `Selected arm does not belong to the target class for student ${studentId}.`

                    );

                }

            }


            /*
            =====================================
            CHECK DESTINATION ENROLLMENT
            =====================================
            */

            const existingEnrollmentResult =
                await client.query(

                    `

                    SELECT

                        id,

                        enrollment_status,

                        class_id,

                        arm_id

                    FROM student_enrollments

                    WHERE

                        student_id = $1

                        AND session_id = $2

                    LIMIT 1;

                    `,

                    [

                        studentId,

                        nextSession.id

                    ]

                );


            if (
                existingEnrollmentResult.rows.length > 0
            ) {

                throw new Error(

                    `Student ${studentId} is already enrolled in ${nextSession.session_name}.`

                );

            }


            /*
            =====================================
            CREATE NEXT SESSION ENROLLMENT
            =====================================
            */

            const enrollmentInsert =
                await client.query(

                    `

                    INSERT INTO student_enrollments
                    (

                        student_id,

                        session_id,

                        class_id,

                        arm_id,

                        enrollment_date,

                        enrollment_status

                    )

                    VALUES
                    (

                        $1,

                        $2,

                        $3,

                        $4,

                        CURRENT_DATE,

                        'Active'

                    )

                    RETURNING

                        id,

                        student_id,

                        session_id,

                        class_id,

                        arm_id,

                        enrollment_date,

                        enrollment_status;

                    `,

                    [

                        studentId,

                        nextSession.id,

                        targetClassId,

                        targetArmId

                    ]

                );


            /*
            =====================================
            MARK CURRENT ENROLLMENT PROCESSED
            =====================================
            */

            await client.query(

                `

                UPDATE student_enrollments

                SET

                    enrollment_status =
                        'Promoted',

                    updated_at =
                        CURRENT_TIMESTAMP

                WHERE id = $1;

                `,

                [

                    currentEnrollment.id

                ]

            );


            /*
            =====================================
            UPDATE STUDENT PROFILE
            =====================================
            */

            await client.query(

                `

                UPDATE students

                SET

                    class_id = $1,

                    arm_id = $2,

                    status = 'Active',

                    updated_at =
                        CURRENT_TIMESTAMP

                WHERE id = $3;

                `,

                [

                    targetClassId,

                    targetArmId,

                    studentId

                ]

            );


            /*
            =====================================
            HISTORY REMARK
            =====================================
            */

            let remarks;


            if (
                action === "Repeated"
            ) {

                remarks =

                    `Student repeated ${currentEnrollment.class_name} for the ${nextSession.session_name} academic session.`;

            } else {

                remarks =

                    `Student promoted from ${currentEnrollment.class_name} to ${destinationClass.class_name} for the ${nextSession.session_name} academic session.`;

            }


            /*
            =====================================
            RECORD PROMOTION HISTORY
            =====================================
            */

            await client.query(

                `

                INSERT INTO student_promotion_history
                (

                    student_id,

                    from_session_id,
                    to_session_id,

                    from_class_id,
                    to_class_id,

                    from_arm_id,
                    to_arm_id,

                    action,

                    remarks,

                    processed_by

                )

                VALUES
                (

                    $1,

                    $2,
                    $3,

                    $4,
                    $5,

                    $6,
                    $7,

                    $8,

                    $9,

                    $10

                );

                `,

                [

                    studentId,

                    currentSessionId,

                    nextSession.id,

                    currentEnrollment.class_id,

                    targetClassId,

                    currentEnrollment.arm_id,

                    targetArmId,

                    action,

                    remarks,

                    processedBy || null

                ]

            );


            /*
            =====================================
            RETURN RESULT
            =====================================
            */

            processedStudents.push({

                studentId,

                action,

                fromSession:
                    currentSession.session_name,

                toSession:
                    nextSession.session_name,

                fromClass:
                    currentEnrollment.class_name,

                toClass:

                    action === "Repeated"

                        ? currentEnrollment.class_name

                        : destinationClass.class_name,

                fromArm:
                    currentEnrollment.arm_name,

                toArm:
                    targetArmId,

                enrollment:
                    enrollmentInsert.rows[0]

            });

        }


        /*
        =========================================
        COMMIT
        =========================================
        */

        await client.query(
            "COMMIT"
        );


        return processedStudents;


    } catch (error) {

        /*
        =========================================
        ROLLBACK
        =========================================
        */

        await client.query(
            "ROLLBACK"
        );


        throw error;


    } finally {

        client.release();

    }

};


/*
=========================================
EXPORTS
=========================================
*/

module.exports = {

    getCurrentSession,

    getNextSession,

    getClasses,

    getArmsByClass,

    getStudentsForPromotion,

    processStudentDecisions

};