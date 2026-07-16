CREATE TABLE student_parents (

    id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL,

    parent_id INTEGER NOT NULL,

    relationship_id INTEGER NOT NULL,

    is_primary_contact BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sp_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sp_parent
        FOREIGN KEY (parent_id)
        REFERENCES parents(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sp_relationship
        FOREIGN KEY (relationship_id)
        REFERENCES relationships(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_student_parent
        UNIQUE(student_id, parent_id)
);