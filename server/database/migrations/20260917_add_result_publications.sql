CREATE TABLE IF NOT EXISTS result_publications (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    arm_id INTEGER,
    session_id INTEGER NOT NULL,
    term_id INTEGER NOT NULL,
    published_by INTEGER NOT NULL,
    published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_result_publication UNIQUE (school_id, class_id, arm_id, session_id, term_id)
);

CREATE INDEX IF NOT EXISTS idx_result_publications_lookup
    ON result_publications (school_id, class_id, arm_id, session_id, term_id);
