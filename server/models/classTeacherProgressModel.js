const pool = require("../config/database");

const listMyClasses = async (userId, schoolId) => {
    const result = await pool.query(`
        SELECT cta.id AS assignment_id, cta.teacher_id, cta.class_id, cta.arm_id, cta.session_id,
               c.class_name, a.arm_name, s.session_name, s.is_current,
               COUNT(DISTINCT se.student_id)::INTEGER AS student_count
        FROM class_teacher_assignments cta
        JOIN teachers t ON t.id = cta.teacher_id AND t.school_id = cta.school_id
        JOIN users u ON u.id = t.user_id AND u.id = $1 AND u.school_id = cta.school_id
        JOIN classes c ON c.id = cta.class_id AND c.school_id = cta.school_id
        LEFT JOIN arms a ON a.id = cta.arm_id AND a.school_id = cta.school_id
        JOIN academic_sessions s ON s.id = cta.session_id AND s.school_id = cta.school_id
        LEFT JOIN student_enrollments se ON se.class_id = cta.class_id
          AND se.session_id = cta.session_id
          AND (cta.arm_id IS NULL OR se.arm_id = cta.arm_id)
          AND se.enrollment_status = 'Active'
        WHERE cta.school_id = $2 AND cta.is_active = TRUE
        GROUP BY cta.id, cta.teacher_id, cta.class_id, cta.arm_id, cta.session_id,
                 c.class_name, a.arm_name, s.session_name, s.is_current
        ORDER BY s.is_current DESC, s.start_date DESC, c.class_name, a.arm_name
    `, [userId, schoolId]);
    return result.rows;
};

const listClassStudents = async (assignmentId, userId, schoolId) => {
    const result = await pool.query(`
        SELECT st.id AS student_id, st.admission_number,
               CONCAT(st.surname, ' ', st.first_name,
                   CASE WHEN COALESCE(st.middle_name, '') = '' THEN '' ELSE ' ' || st.middle_name END
               ) AS student_name,
               cta.id AS assignment_id, cta.session_id, c.class_name, a.arm_name
        FROM class_teacher_assignments cta
        JOIN teachers t ON t.id = cta.teacher_id AND t.school_id = cta.school_id
        JOIN users u ON u.id = t.user_id AND u.id = $2 AND u.school_id = cta.school_id
        JOIN classes c ON c.id = cta.class_id AND c.school_id = cta.school_id
        LEFT JOIN arms a ON a.id = cta.arm_id AND a.school_id = cta.school_id
        JOIN student_enrollments se ON se.class_id = cta.class_id
          AND se.session_id = cta.session_id
          AND (cta.arm_id IS NULL OR se.arm_id = cta.arm_id)
          AND se.enrollment_status = 'Active'
        JOIN students st ON st.id = se.student_id AND st.school_id = cta.school_id
        WHERE cta.id = $1 AND cta.school_id = $3 AND cta.is_active = TRUE
        ORDER BY st.surname, st.first_name
    `, [assignmentId, userId, schoolId]);
    return result.rows;
};

const createDraftReport = async (data, userId, schoolId) => {
    const result = await pool.query(`
        INSERT INTO student_progress_reports (
            school_id, class_teacher_assignment_id, student_id, session_id, term_id,
            report_type, period_start, period_end, class_teacher_comment, strengths,
            areas_for_improvement, created_by
        )
        SELECT $1, cta.id, se.student_id, cta.session_id, $7,
               $8, $9::date, $10::date, $11, $12, $13, $2
        FROM class_teacher_assignments cta
        JOIN teachers t ON t.id = cta.teacher_id AND t.school_id = cta.school_id
        JOIN users u ON u.id = t.user_id AND u.id = $2 AND u.school_id = cta.school_id
        JOIN terms tr ON tr.id = $7 AND tr.session_id = cta.session_id
        JOIN student_enrollments se ON se.student_id = $4 AND se.session_id = cta.session_id
          AND se.class_id = cta.class_id
          AND (cta.arm_id IS NULL OR se.arm_id = cta.arm_id)
          AND se.enrollment_status = 'Active'
        WHERE cta.id = $3 AND cta.school_id = $1 AND cta.is_active = TRUE
        ON CONFLICT (school_id, student_id, session_id, term_id, report_type, period_start, period_end)
        DO UPDATE SET
          class_teacher_comment = EXCLUDED.class_teacher_comment,
          strengths = EXCLUDED.strengths,
          areas_for_improvement = EXCLUDED.areas_for_improvement,
          updated_at = CURRENT_TIMESTAMP
        WHERE student_progress_reports.status IN ('draft', 'returned')
        RETURNING *
    `, [
        schoolId, userId, data.assignment_id, data.student_id, null, null,
        data.term_id, data.report_type, data.period_start, data.period_end,
        data.class_teacher_comment || null, data.strengths || null,
        data.areas_for_improvement || null
    ]);
    return result.rows[0] || null;
};

module.exports = { listMyClasses, listClassStudents, createDraftReport };
