CREATE TABLE student_payments (

    id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL,

    session_id INTEGER NOT NULL,

    term_id INTEGER NOT NULL,

    amount_paid NUMERIC(12,2) NOT NULL,

    payment_date DATE NOT NULL,

    payment_method VARCHAR(30),

    reference_number VARCHAR(100),

    received_by INTEGER,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(student_id)
        REFERENCES students(id),

    FOREIGN KEY(session_id)
        REFERENCES academic_sessions(id),

    FOREIGN KEY(term_id)
        REFERENCES terms(id),

    FOREIGN KEY(received_by)
        REFERENCES users(id)
);