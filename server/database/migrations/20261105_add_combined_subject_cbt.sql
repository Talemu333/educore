-- Combined-subject CBT examinations.
-- Preserve the legacy cbt_exams.subject_id as the primary/first subject so
-- existing API consumers and single-subject examinations remain compatible.
-- Existing questions are assigned to their examination's legacy subject.
-- Idempotent and safe to run for every tenant database and the shared database.

BEGIN;

CREATE TABLE IF NOT EXISTS cbt_exam_subjects (
    school_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    section_title VARCHAR(255) NOT NULL,
    section_order INTEGER NOT NULL CHECK (section_order > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_cbt_exam_subjects PRIMARY KEY (exam_id, subject_id),
    CONSTRAINT uq_cbt_exam_subject_section_order UNIQUE (exam_id, section_order),
    CONSTRAINT fk_cbt_exam_subjects_school
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cbt_exam_subjects_exam
        FOREIGN KEY (exam_id) REFERENCES cbt_exams(id) ON DELETE CASCADE,
    CONSTRAINT fk_cbt_exam_subjects_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT
);

ALTER TABLE cbt_questions
    ADD COLUMN IF NOT EXISTS subject_id INTEGER;

-- Backfill all existing questions without changing their IDs, order, marks,
-- options, attempts, answers, or published results.
UPDATE cbt_questions q
SET subject_id = e.subject_id
FROM cbt_exams e
WHERE e.id = q.exam_id
  AND e.school_id = q.school_id
  AND q.subject_id IS NULL;

-- Seed every legacy examination as a one-subject examination. ON CONFLICT
-- keeps this migration repeatable and preserves any existing section metadata.
INSERT INTO cbt_exam_subjects
    (school_id, exam_id, subject_id, section_title, section_order)
SELECT e.school_id, e.id, e.subject_id, COALESCE(s.subject_name, 'Subject'), 1
FROM cbt_exams e
JOIN subjects s
  ON s.id = e.subject_id
 AND s.school_id = e.school_id
ON CONFLICT (exam_id, subject_id) DO NOTHING;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cbt_questions WHERE subject_id IS NULL) THEN
        RAISE EXCEPTION 'Combined-subject CBT migration could not assign a subject to every existing question.';
    END IF;
END $$;

ALTER TABLE cbt_questions
    ALTER COLUMN subject_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_cbt_question_subject'
          AND conrelid = 'cbt_questions'::regclass
    ) THEN
        ALTER TABLE cbt_questions
            ADD CONSTRAINT fk_cbt_question_subject
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cbt_exam_subjects_school_exam
    ON cbt_exam_subjects (school_id, exam_id, section_order);
CREATE INDEX IF NOT EXISTS idx_cbt_exam_subjects_school_subject
    ON cbt_exam_subjects (school_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_cbt_questions_exam_subject
    ON cbt_questions (school_id, exam_id, subject_id, question_order);

COMMIT;
