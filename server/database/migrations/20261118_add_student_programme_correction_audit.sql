-- Auditable corrections for senior programme/subject registrations after results exist.
-- Historical student_results rows are deliberately not updated or deleted.
BEGIN;
CREATE TABLE IF NOT EXISTS student_programme_correction_audit (
    id BIGSERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    session_id INTEGER NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    previous_programme_id INTEGER,
    previous_programme_name VARCHAR(100),
    previous_subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    new_programme_id INTEGER NOT NULL,
    new_programme_name VARCHAR(100) NOT NULL,
    new_subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    result_count INTEGER NOT NULL DEFAULT 0,
    corrected_by INTEGER,
    corrected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_student_programme_correction_audit_lookup
ON student_programme_correction_audit (school_id, student_id, session_id, corrected_at DESC);
COMMIT;
