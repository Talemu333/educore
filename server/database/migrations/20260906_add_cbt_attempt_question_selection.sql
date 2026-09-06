BEGIN;

-- Stores the exact question set assigned to each CBT attempt.
-- This makes random question selection stable for the duration of an attempt
-- and prevents students from answering questions that were not selected for them.

ALTER TABLE cbt_exams
    ADD COLUMN IF NOT EXISTS question_selection_count INTEGER NOT NULL DEFAULT 0
        CHECK (question_selection_count >= 0);

CREATE TABLE IF NOT EXISTS cbt_attempt_questions (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    attempt_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    question_order INTEGER NOT NULL CHECK (question_order > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cbt_attempt_question_school
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cbt_attempt_question_attempt
        FOREIGN KEY (attempt_id) REFERENCES cbt_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cbt_attempt_question_question
        FOREIGN KEY (question_id) REFERENCES cbt_questions(id) ON DELETE CASCADE,
    CONSTRAINT uq_cbt_attempt_question_selection
        UNIQUE (attempt_id, question_id),
    CONSTRAINT uq_cbt_attempt_question_order
        UNIQUE (attempt_id, question_order)
);

CREATE INDEX IF NOT EXISTS idx_cbt_attempt_questions_attempt
    ON cbt_attempt_questions(attempt_id);

CREATE INDEX IF NOT EXISTS idx_cbt_attempt_questions_school_attempt
    ON cbt_attempt_questions(school_id, attempt_id);

-- Existing exams keep the current behaviour: all exam questions are served.
-- Set question_selection_count to a positive number on an exam to serve only
-- that many randomly selected questions per attempt.

COMMIT;
