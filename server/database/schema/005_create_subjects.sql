CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,

    subject_name VARCHAR(100) NOT NULL,

    subject_code VARCHAR(10) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_subject_name
        UNIQUE (subject_name),

    CONSTRAINT uq_subject_code
        UNIQUE (subject_code)
);