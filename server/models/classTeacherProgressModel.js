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
        SELECT $1, cta.id, se.student_id, cta.session_id, $5,
               $6, $7::date, $8::date, $9, $10, $11, $2
        FROM class_teacher_assignments cta
        JOIN teachers t ON t.id = cta.teacher_id AND t.school_id = cta.school_id
        JOIN users u ON u.id = t.user_id AND u.id = $2 AND u.school_id = cta.school_id
        JOIN terms tr ON tr.id = $5 AND tr.session_id = cta.session_id AND tr.school_id = cta.school_id
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
        schoolId, userId, data.assignment_id, data.student_id, data.term_id,
        data.report_type, data.period_start, data.period_end,
        data.class_teacher_comment || null, data.strengths || null,
        data.areas_for_improvement || null
    ]);
    return result.rows[0] || null;
};

const submitDraftReport = async (reportId, userId, schoolId) => {
    const result = await pool.query(`
        UPDATE student_progress_reports spr
        SET status = 'submitted', submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE spr.id = $1 AND spr.school_id = $2 AND spr.status IN ('draft', 'returned')
          AND EXISTS (
            SELECT 1
            FROM class_teacher_assignments cta
            JOIN teachers t ON t.id = cta.teacher_id AND t.school_id = cta.school_id
            JOIN users u ON u.id = t.user_id AND u.school_id = cta.school_id
            WHERE cta.id = spr.class_teacher_assignment_id
              AND cta.school_id = spr.school_id AND cta.is_active = TRUE
              AND u.id = $3
          )
        RETURNING spr.*
    `, [reportId, schoolId, userId]);
    return result.rows[0] || null;
};

const listReportsForReview = async (schoolId) => {
    const result = await pool.query(`
        SELECT spr.id, spr.student_id, spr.report_type, spr.period_start, spr.period_end,
               spr.class_teacher_comment, spr.strengths, spr.areas_for_improvement,
               spr.status, spr.created_at, spr.submitted_at,
               CONCAT(st.surname, ' ', st.first_name,
                 CASE WHEN COALESCE(st.middle_name, '') = '' THEN '' ELSE ' ' || st.middle_name END
               ) AS student_name,
               st.admission_number, c.class_name, a.arm_name, s.session_name, tr.term_name,
               CONCAT(t.surname, ' ', t.first_name) AS class_teacher_name
        FROM student_progress_reports spr
        JOIN students st ON st.id = spr.student_id AND st.school_id = spr.school_id
        JOIN class_teacher_assignments cta ON cta.id = spr.class_teacher_assignment_id AND cta.school_id = spr.school_id
        JOIN teachers t ON t.id = cta.teacher_id AND t.school_id = cta.school_id
        JOIN classes c ON c.id = cta.class_id AND c.school_id = spr.school_id
        LEFT JOIN arms a ON a.id = cta.arm_id AND a.school_id = spr.school_id
        JOIN academic_sessions s ON s.id = spr.session_id AND s.school_id = spr.school_id
        JOIN terms tr ON tr.id = spr.term_id AND tr.school_id = spr.school_id
        WHERE spr.school_id = $1 AND spr.status IN ('submitted', 'approved')
        ORDER BY CASE spr.status WHEN 'submitted' THEN 0 ELSE 1 END,
                 spr.submitted_at ASC NULLS LAST, spr.created_at DESC
    `, [schoolId]);
    return result.rows;
};

const reviewReport = async (reportId, schoolId, reviewerId, action, note) => {
    if (action === 'return') {
        const result = await pool.query(`
            UPDATE student_progress_reports
            SET status = 'returned', reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP,
                class_teacher_comment = CASE
                  WHEN $4::text IS NULL OR $4::text = '' THEN class_teacher_comment
                  ELSE CONCAT(COALESCE(class_teacher_comment, ''), E'\\n\\nReview note: ', $4::text)
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND school_id = $2 AND status = 'submitted'
            RETURNING *
        `, [reportId, schoolId, reviewerId, note || null]);
        return result.rows[0] || null;
    }
    const result = await pool.query(`
        UPDATE student_progress_reports
        SET status = 'approved', reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND school_id = $2 AND status = 'submitted'
        RETURNING *
    `, [reportId, schoolId, reviewerId]);
    return result.rows[0] || null;
};

const publishReport = async (reportId, schoolId, reviewerId) => {
    const result = await pool.query(`
        UPDATE student_progress_reports
        SET status = 'published', reviewed_by = $3,
            reviewed_at = COALESCE(reviewed_at, CURRENT_TIMESTAMP),
            published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND school_id = $2 AND status = 'approved'
        RETURNING *
    `, [reportId, schoolId, reviewerId]);
    return result.rows[0] || null;
};

module.exports = {
    listMyClasses, listClassStudents, createDraftReport,
    submitDraftReport, listReportsForReview, reviewReport, publishReport
};
