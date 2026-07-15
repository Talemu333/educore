CREATE TABLE class_subjects (
    id SERIAL PRIMARY KEY,

    class_id INTEGER NOT NULL,

    subject_id INTEGER NOT NULL,

    is_compulsory BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cs_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_cs_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_class_subject
        UNIQUE (class_id, subject_id)
);