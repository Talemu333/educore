CREATE TABLE classes (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    class_name VARCHAR(20) NOT NULL,

    class_level VARCHAR(10) NOT NULL,

    sort_order INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_class_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_school_class_name
        UNIQUE (school_id, class_name),

    CONSTRAINT uq_school_class_sort_order
        UNIQUE (school_id, sort_order),

    CONSTRAINT chk_class_level
        CHECK (
            class_level IN (
                'Junior',
                'Senior'
            )
        )
); 

CREATE INDEX idx_classes_school_id
    ON classes (school_id);
