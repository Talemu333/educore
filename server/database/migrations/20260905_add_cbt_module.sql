BEGIN;

-- EduCore CBT module (multiple-choice only).
-- Supports text and image-based questions. Audio/video questions are intentionally excluded.

CREATE TABLE IF NOT EXISTS cbt_exams (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    arm_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    total_marks NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_marks >= 0),
    pass_mark NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (pass_mark >= 0),
    max_attempts INTEGER NOT NULL DEFAULT 1 CHECK (max_attempts > 0),
    randomize_questions BOOLEAN NOT NULL DEFAULT FALSE,
    randomize_options BOOLEAN NOT NULL DEFAULT FALSE,
    show_result_immediately BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'closed')),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cbt_exam_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cbt_exam_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cbt_exam_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cbt_exam_arm FOREIGN KEY (arm_id) REFERENCES arms(id) ON DELETE SET NULL,
    CONSTRAINT fk_cbt_exam_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT cbt_exam_dates_check CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS cbt_questions (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    image_url TEXT,
    marks NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (marks > 0),
    question_order INTEGER NOT NULL DEFAULT 1 CHECK (question_order > 0),
    explanation TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cbt_question_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cbt_question_exam FOREIGN KEY (exam_id) REFERENCES cbt_exams(id) ON DELETE CASCADE,
    CONSTRAINT uq_cbt_question_order UNIQUE (exam_id, question_order)
);

CREATE TABLE IF NOT EXISTS cbt_question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    option_image_url TEXT,
    option_order INTEGER NOT NULL CHECK (option_order > 0),
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cbt_option_question FOREIGN KEY (question_id) REFERENCES cbt_questions(id) ON DELETE CASCADE,
    CONSTRAINT uq_cbt_option_order UNIQUE (question_id, option_order)
);

CREATE TABLE IF NOT EXISTS cbt_attempts (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    expires_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'submitted', 'expired')),
    score NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (score >= 0),
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
    correct_answers INTEGER NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
    wrong_answers INTEGER NOT NULL DEFAULT 0 CHECK (wrong_answers >= 0),
    unanswered INTEGER NOT NULL DEFAULT 0 CHECK (unanswered >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cbt_attempt_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cbt_attempt_exam FOREIGN KEY (exam_id) REFERENCES cbt_exams(id) ON DELETE CASCADE,
    CONSTRAINT fk_cbt_attempt_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT uq_cbt_student_exam_attempt UNIQUE (exam_id, student_id, attempt_number)
);

CREATE TABLE IF NOT EXISTS cbt_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    selected_option_id INTEGER,
    is_correct BOOLEAN,
    marks_awarded NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (marks_awarded >= 0),
    answered_at TIMESTAMP,
    CONSTRAINT fk_cbt_answer_attempt FOREIGN KEY (attempt_id) REFERENCES cbt_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cbt_answer_question FOREIGN KEY (question_id) REFERENCES cbt_questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_cbt_answer_option FOREIGN KEY (selected_option_id) REFERENCES cbt_question_options(id) ON DELETE SET NULL,
    CONSTRAINT uq_cbt_attempt_question UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_cbt_exams_school ON cbt_exams(school_id);
CREATE INDEX IF NOT EXISTS idx_cbt_exams_school_class ON cbt_exams(school_id, class_id, arm_id);
CREATE INDEX IF NOT EXISTS idx_cbt_exams_school_subject ON cbt_exams(school_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_cbt_questions_school_exam ON cbt_questions(school_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_cbt_options_question ON cbt_question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_cbt_attempts_school_student ON cbt_attempts(school_id, student_id);
CREATE INDEX IF NOT EXISTS idx_cbt_attempts_exam ON cbt_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_cbt_answers_attempt ON cbt_answers(attempt_id);

COMMIT;
