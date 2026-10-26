-- Student progress report records coordinated by class teachers.
-- Designed for draft -> submitted -> approved/published workflow.
BEGIN;

CREATE TABLE IF NOT EXISTS student_progress_reports (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    class_teacher_assignment_id INTEGER NOT NULL REFERENCES class_teacher_assignments(id) ON DELETE RESTRICT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    session_id INTEGER NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
    term_id INTEGER NOT NULL REFERENCES terms(id) ON DELETE RESTRICT,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('weekly', 'midterm', 'quarter_term', 'end_of_term')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    class_teacher_comment TEXT,
    strengths TEXT,
    areas_for_improvement TEXT,
    attendance_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    academic_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'published', 'returned')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    published_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_progress_report_period CHECK (period_end >= period_start),
    CONSTRAINT uq_progress_report_period UNIQUE
      (school_id, student_id, session_id, term_id, report_type, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_progress_reports_school_status
  ON student_progress_reports (school_id, status, session_id, term_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_student_published
  ON student_progress_reports (school_id, student_id, published_at DESC)
  WHERE status = 'published';

COMMIT;
