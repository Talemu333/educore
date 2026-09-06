BEGIN;

-- Reusable CBT question bank. Questions are stored independently from exams,
-- then copied into an exam when selected. Text/image MCQ only.
CREATE TABLE IF NOT EXISTS cbt_question_bank (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    image_url TEXT,
    marks NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (marks > 0),
    explanation TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cbt_bank_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cbt_bank_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cbt_bank_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cbt_bank_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS cbt_question_bank_options (
    id SERIAL PRIMARY KEY,
    bank_question_id INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    option_image_url TEXT,
    option_order INTEGER NOT NULL CHECK (option_order > 0),
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_cbt_bank_option_question FOREIGN KEY (bank_question_id) REFERENCES cbt_question_bank(id) ON DELETE CASCADE,
    CONSTRAINT uq_cbt_bank_option_order UNIQUE (bank_question_id, option_order)
);

CREATE INDEX IF NOT EXISTS idx_cbt_bank_school_subject_class ON cbt_question_bank(school_id, subject_id, class_id);
CREATE INDEX IF NOT EXISTS idx_cbt_bank_school_active ON cbt_question_bank(school_id, is_active);
CREATE INDEX IF NOT EXISTS idx_cbt_bank_options_question ON cbt_question_bank_options(bank_question_id);

COMMIT;
