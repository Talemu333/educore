const pool = require("../config/database");

const getCurrentSession = async (schoolId) => {
    const result = await pool.query(`
        SELECT id, session_name, start_date, end_date, is_current
        FROM academic_sessions
        WHERE school_id = $1 AND (is_current = TRUE OR id = (
            SELECT current_session_id FROM school_settings WHERE school_id = $1 LIMIT 1
        ))
        ORDER BY (id = (SELECT current_session_id FROM school_settings WHERE school_id = $1 LIMIT 1)) DESC,
                 is_current DESC, start_date DESC, id DESC
        LIMIT 1;
    `, [schoolId]);
    return result.rows[0];
};

const getNextSession = async (currentSessionId, schoolId) => {
    const result = await pool.query(`
        SELECT id, session_name, start_date, end_date, is_current
        FROM academic_sessions
        WHERE school_id = $1 AND id <> $2 AND start_date > (
            SELECT start_date FROM academic_sessions WHERE id = $2 AND school_id = $1
        )
        ORDER BY start_date ASC, id ASC
        LIMIT 1;
    `, [schoolId, currentSessionId]);
    return result.rows[0];
};

const getClasses = async (schoolId) => {
    const result = await pool.query(`
        SELECT id, class_name, class_level, sort_order
        FROM classes
        WHERE school_id = $1
        ORDER BY sort_order ASC, id ASC;
    `, [schoolId]);
    return result.rows;
};

const getArmsByClass = async (classId, schoolId) => {
    const result = await pool.query(`
        SELECT a.id, a.arm_name, a.class_id
        FROM arms a
        JOIN classes c ON c.id = a.class_id
        WHERE a.class_id = $1 AND a.school_id = $2 AND c.school_id = $2
        ORDER BY a.arm_name ASC;
    `, [classId, schoolId]);
    return result.rows;
};

const getStudentsForPromotion = async ({ sessionId, classId, armId, schoolId }) => {
    const values = [schoolId, sessionId, classId];
    let armCondition = "";
    if (armId) {
        values.push(armId);
        armCondition = `AND se.arm_id = $4`;
    }

    const result = await pool.query(`
        SELECT s.id AS student_id, s.admission_number, s.surname, s.first_name,
               s.middle_name, s.gender, s.status AS student_status,
               se.id AS enrollment_id, se.session_id, se.class_id, se.arm_id,
               se.enrollment_status, c.class_name, c.class_level,
               c.sort_order AS class_sort_order, a.arm_name
        FROM student_enrollments se
        JOIN students s ON s.id = se.student_id
        JOIN classes c ON c.id = se.class_id
        LEFT JOIN arms a ON a.id = se.arm_id
        WHERE s.school_id = $1 AND se.school_id = $1
          AND c.school_id = $1 AND (a.school_id = $1 OR a.id IS NULL)
          AND se.session_id = $2 AND se.class_id = $3
          ${armCondition}
          AND LOWER(COALESCE(se.enrollment_status, 'active')) = 'active'
          AND LOWER(COALESCE(s.status, 'active')) = 'active'
        ORDER BY s.surname ASC, s.first_name ASC, s.middle_name ASC;
    `, values);
    return result.rows;
};

const validatePromotionInput = async ({ students, currentSessionId, nextSessionId, destinationClassId, defaultArmId, schoolId }) => {
    const sessionResult = await pool.query(`
        SELECT id FROM academic_sessions WHERE id = $1 AND school_id = $2;
    `, [currentSessionId, schoolId]);
    if (!sessionResult.rows[0]) throw new Error("Current academic session does not belong to this school.");

    if (nextSessionId) {
        const nextResult = await pool.query(`SELECT id FROM academic_sessions WHERE id=$1 AND school_id=$2`, [nextSessionId, schoolId]);
        if (!nextResult.rows[0]) throw new Error("Destination academic session does not belong to this school.");
    }

    if (destinationClassId) {
        const classResult = await pool.query(`SELECT id FROM classes WHERE id=$1 AND school_id=$2`, [destinationClassId, schoolId]);
        if (!classResult.rows[0]) throw new Error("Destination class does not belong to this school.");
    }

    if (defaultArmId) {
        const armResult = await pool.query(`SELECT id FROM arms WHERE id=$1 AND school_id=$2`, [defaultArmId, schoolId]);
        if (!armResult.rows[0]) throw new Error("Default arm does not belong to this school.");
    }

    for (const student of students) {
        const result = await pool.query(`
            SELECT se.student_id
            FROM student_enrollments se
            JOIN students s ON s.id = se.student_id
            WHERE se.student_id=$1 AND se.session_id=$2 AND se.school_id=$3 AND s.school_id=$3
            LIMIT 1;
        `, [Number(student.studentId), currentSessionId, schoolId]);
        if (!result.rows[0]) throw new Error(`Student ${student.studentId} does not belong to this school/current session.`);

        if (student.armId) {
            const armResult = await pool.query(`SELECT id FROM arms WHERE id=$1 AND school_id=$2`, [student.armId, schoolId]);
            if (!armResult.rows[0]) throw new Error(`Selected arm for student ${student.studentId} does not belong to this school.`);
        }
    }
};

module.exports = { getCurrentSession, getNextSession, getClasses, getArmsByClass, getStudentsForPromotion, validatePromotionInput };
