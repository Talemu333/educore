CREATE TABLE terms (
    id SERIAL PRIMARY KEY,

    session_id INTEGER NOT NULL,

    term_name VARCHAR(20) NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    is_current BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_term_session
        FOREIGN KEY (session_id)
        REFERENCES academic_sessions(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_session_term
        UNIQUE (session_id, term_name),

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