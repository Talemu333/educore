CREATE TABLE academic_sessions (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    session_name VARCHAR(20) NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    is_current BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_academic_session_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_school_session_name
        UNIQUE (school_id, session_name),

    CONSTRAINT chk_session_dates
        CHECK (end_date > start_date)
);

CREATE UNIQUE INDEX uq_one_current_session_per_school
    ON academic_sessions (school_id)
    WHERE is_current = TRUE;

CREATE INDEX idx_academic_sessions_school_id
    ON academic_sessions (school_id);
