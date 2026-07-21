CREATE TABLE fee_structures (

    id SERIAL PRIMARY KEY,

    session_id INTEGER NOT NULL,

    term_id INTEGER NOT NULL,

    class_id INTEGER NOT NULL,

    fee_type_id INTEGER NOT NULL,

    amount NUMERIC(12,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(session_id)
        REFERENCES academic_sessions(id),

    FOREIGN KEY(term_id)
        REFERENCES terms(id),

    FOREIGN KEY(class_id)
        REFERENCES classes(id),

    FOREIGN KEY(fee_type_id)
        REFERENCES fee_types(id)
);