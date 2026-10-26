const pool = require("../config/database");

const listAssignments = async (schoolId) => {
    const result = await pool.query(`
        SELECT cta.id, cta.teacher_id, cta.class_id, cta.arm_id, cta.session_id,
               cta.is_active, cta.created_at,
               t.staff_number,
               CONCAT(t.surname, ' ', t.first_name,
                   CASE WHEN COALESCE(t.middle_name, '') = '' THEN '' ELSE ' ' || t.middle_name END
               ) AS teacher_name,
               c.class_name, a.arm_name, s.session_name
        FROM class_teacher_assignments cta
        JOIN teachers t ON t.id = cta.teacher_id AND t.school_id = cta.school_id
        JOIN classes c ON c.id = cta.class_id AND c.school_id = cta.school_id
        LEFT JOIN arms a ON a.id = cta.arm_id AND a.school_id = cta.school_id
        JOIN academic_sessions s ON s.id = cta.session_id AND s.school_id = cta.school_id
        WHERE cta.school_id = $1
        ORDER BY cta.is_active DESC, s.start_date DESC, c.class_name, a.arm_name;
    `, [schoolId]);
    return result.rows;
};

const validateReferences = async ({ teacher_id, class_id, arm_id, session_id }, schoolId) => {
    const result = await pool.query(`
        SELECT
            EXISTS(SELECT 1 FROM teachers WHERE id=$1 AND school_id=$5 AND COALESCE(status, TRUE)=TRUE) AS teacher_ok,
            EXISTS(SELECT 1 FROM classes WHERE id=$2 AND school_id=$5) AS class_ok,
            EXISTS(SELECT 1 FROM academic_sessions WHERE id=$4 AND school_id=$5) AS session_ok,
            CASE WHEN $3::integer IS NULL THEN TRUE ELSE EXISTS(
                SELECT 1 FROM arms WHERE id=$3 AND class_id=$2 AND school_id=$5
            ) END AS arm_ok
    `, [teacher_id, class_id, arm_id || null, session_id, schoolId]);
    return result.rows[0];
};

const createAssignment = async ({ teacher_id, class_id, arm_id, session_id, assigned_by }, schoolId) => {
    const result = await pool.query(`
        INSERT INTO class_teacher_assignments
            (school_id, teacher_id, class_id, arm_id, session_id, assigned_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, teacher_id, class_id, arm_id, session_id, is_active, created_at
    `, [schoolId, teacher_id, class_id, arm_id || null, session_id, assigned_by || null]);
    return result.rows[0];
};

const deactivateAssignment = async (id, schoolId) => {
    const result = await pool.query(`
        UPDATE class_teacher_assignments
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND school_id = $2 AND is_active = TRUE
        RETURNING id
    `, [id, schoolId]);
    return result.rows[0];
};

module.exports = { listAssignments, validateReferences, createAssignment, deactivateAssignment };
