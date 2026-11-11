-- Shared materials for grouped CBT questions (comprehension, diagrams, graphs, tables and instructions).
-- Questions remain compatible when question_group_id is NULL.
BEGIN;

CREATE TABLE IF NOT EXISTS cbt_question_groups (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    material_type VARCHAR(30) NOT NULL CHECK (material_type IN ('passage','instruction','diagram','image','table','graph','mixed')),
    instructions TEXT,
    material_text TEXT,
    image_url TEXT,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cbt_question_groups_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cbt_question_groups_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cbt_question_groups_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cbt_question_groups_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_cbt_question_groups_id_school ON cbt_question_groups(id, school_id);
CREATE INDEX IF NOT EXISTS idx_cbt_question_groups_school_subject_class ON cbt_question_groups(school_id, subject_id, class_id);

ALTER TABLE cbt_questions ADD COLUMN IF NOT EXISTS question_group_id INTEGER;
ALTER TABLE cbt_question_bank ADD COLUMN IF NOT EXISTS question_group_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_cbt_questions_group_school' AND conrelid='cbt_questions'::regclass) THEN
        ALTER TABLE cbt_questions ADD CONSTRAINT fk_cbt_questions_group_school
            FOREIGN KEY (question_group_id, school_id)
            REFERENCES cbt_question_groups(id, school_id) ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_cbt_question_bank_group_school' AND conrelid='cbt_question_bank'::regclass) THEN
        ALTER TABLE cbt_question_bank ADD CONSTRAINT fk_cbt_question_bank_group_school
            FOREIGN KEY (question_group_id, school_id)
            REFERENCES cbt_question_groups(id, school_id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cbt_questions_group ON cbt_questions(school_id, question_group_id, question_order);
CREATE INDEX IF NOT EXISTS idx_cbt_question_bank_group ON cbt_question_bank(school_id, question_group_id);

COMMIT;
