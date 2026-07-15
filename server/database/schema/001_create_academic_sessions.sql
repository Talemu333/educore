CREATE TABLE academic_sessions (
    id SERIAL PRIMARY KEY,

    session_name VARCHAR(20) NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    is_current BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_session_name
        UNIQUE (session_name),

    CONSTRAINT chk_session_dates
        CHECK (end_date > start_date)
);