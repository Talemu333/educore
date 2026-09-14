CREATE TABLE IF NOT EXISTS lesson_note_topics (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    session_id INTEGER NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
    term_id INTEGER NOT NULL REFERENCES terms(id) ON DELETE RESTRICT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 52),
    topic VARCHAR(255) NOT NULL,
    sub_topic VARCHAR(255),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_lesson_note_topic_context UNIQUE (school_id, session_id, term_id, class_id, subject_id, week_number, topic)
);

CREATE INDEX IF NOT EXISTS idx_lesson_note_topics_school ON lesson_note_topics(school_id);
CREATE INDEX IF NOT EXISTS idx_lesson_note_topics_context ON lesson_note_topics(school_id, session_id, term_id, class_id, subject_id, week_number, sort_order);

CREATE OR REPLACE FUNCTION update_lesson_note_topics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lesson_note_topics_updated_at ON lesson_note_topics;
CREATE TRIGGER lesson_note_topics_updated_at
BEFORE UPDATE ON lesson_note_topics
FOR EACH ROW EXECUTE FUNCTION update_lesson_note_topics_updated_at();
