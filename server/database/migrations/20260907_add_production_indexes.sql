BEGIN;

-- Keep paginated student CBT history fast as the number of attempts grows.
CREATE INDEX IF NOT EXISTS idx_cbt_attempts_school_student_created
    ON cbt_attempts(school_id, student_id, created_at DESC, id DESC);

-- Speed up active-attempt and attempt-limit checks for a student's exam.
CREATE INDEX IF NOT EXISTS idx_cbt_attempts_school_student_exam_status
    ON cbt_attempts(school_id, student_id, exam_id, status);

COMMIT;
