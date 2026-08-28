CREATE TABLE terms (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    session_id INTEGER NOT NULL,

    term_name VARCHAR(20) NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    is_current BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_term_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_term_session_school
        FOREIGN KEY (session_id, school_id)
        REFERENCES academic_sessions(id, school_id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_school_session_term
        UNIQUE (school_id, session_id, term_name),

    CONSTRAINT chk_term_dates
        CHECK (end_date > start_date),

    CONSTRAINT chk_term_name
        CHECK (
            term_name IN (
                'First Term',
                'Second Term',
                'Third Term'
            )
        )
);

CREATE UNIQUE INDEX uq_one_current_term_per_school_session
    ON terms (school_id, session_id)
    WHERE is_current = TRUE;

CREATE INDEX idx_terms_school_id
    ON terms (school_id);

CREATE INDEX idx_terms_school_session
    ON terms (school_id, session_id);
