CREATE TABLE IF NOT EXISTS lesson_notes (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    session_id INTEGER NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
    term_id INTEGER NOT NULL REFERENCES terms(id) ON DELETE RESTRICT,
    week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 52),
    lesson_date DATE,
    topic VARCHAR(255) NOT NULL,
    sub_topic VARCHAR(255),
    duration VARCHAR(100),
    objectives TEXT,
    instructional_materials TEXT,
    previous_knowledge TEXT,
    introduction TEXT,
    lesson_development TEXT,
    teacher_activities TEXT,
    student_activities TEXT,
    evaluation TEXT,
    conclusion TEXT,
    assignment TEXT,
    references TEXT,
    remarks TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','returned')),
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lesson_notes_school ON lesson_notes(school_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_teacher ON lesson_notes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_context ON lesson_notes(school_id, session_id, term_id, class_id, subject_id, week_number);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_status ON lesson_notes(school_id, status);

CREATE OR REPLACE FUNCTION update_lesson_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lesson_notes_updated_at ON lesson_notes;
CREATE TRIGGER lesson_notes_updated_at
BEFORE UPDATE ON lesson_notes
FOR EACH ROW EXECUTE FUNCTION update_lesson_notes_updated_at();
