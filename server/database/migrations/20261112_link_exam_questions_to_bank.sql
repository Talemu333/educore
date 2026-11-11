-- Preserve the source question-bank link for examination questions.
-- This allows shared-material groups created after import to appear in those exams.
BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS uq_cbt_question_bank_id_school
    ON cbt_question_bank(id, school_id);

ALTER TABLE cbt_questions ADD COLUMN IF NOT EXISTS question_bank_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_cbt_questions_bank_source_school' AND conrelid='cbt_questions'::regclass) THEN
        ALTER TABLE cbt_questions ADD CONSTRAINT fk_cbt_questions_bank_source_school
            FOREIGN KEY (question_bank_id, school_id)
            REFERENCES cbt_question_bank(id, school_id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cbt_questions_bank_source
    ON cbt_questions(school_id, question_bank_id);

COMMIT;
