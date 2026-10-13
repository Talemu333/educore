-- Tenant-local result correction approvals and safe CBT result defaults.
-- Idempotent: applies to existing school databases and databases provisioned later.
CREATE TABLE IF NOT EXISTS result_correction_requests (
    id BIGSERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    student_result_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    teacher_assignment_id INTEGER NOT NULL,
    session_id INTEGER NOT NULL,
    term_id INTEGER NOT NULL,
    requested_by INTEGER NOT NULL,
    old_ca_score NUMERIC(7,2) NOT NULL,
    old_exam_score NUMERIC(7,2) NOT NULL,
    proposed_ca_score NUMERIC(7,2) NOT NULL,
    proposed_exam_score NUMERIC(7,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by INTEGER,
    reviewed_at TIMESTAMPTZ,
    review_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_result_correction_requests_pending
    ON result_correction_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_result_correction_requests_school
    ON result_correction_requests (school_id, status, created_at DESC);

-- One outstanding request per result avoids conflicting approvals.
CREATE UNIQUE INDEX IF NOT EXISTS uq_result_correction_pending_per_result
    ON result_correction_requests (student_result_id)
    WHERE status = 'pending';

-- Existing CBT results must not remain visible simply because an older exam
-- had the immediate-display flag enabled before result publication controls.
ALTER TABLE cbt_exams
    ALTER COLUMN show_result_immediately SET DEFAULT FALSE;

UPDATE cbt_exams
SET show_result_immediately = FALSE,
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
WHERE show_result_immediately IS DISTINCT FROM FALSE;
