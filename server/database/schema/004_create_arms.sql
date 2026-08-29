CREATE TABLE arms (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    class_id INTEGER NOT NULL,

    arm_name VARCHAR(10) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_arm_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_arm_class_school
        FOREIGN KEY (class_id, school_id)
        REFERENCES classes(id, school_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_school_arm_name
        UNIQUE (school_id, arm_name)
);

CREATE INDEX idx_arms_school_id
    ON arms (school_id);

CREATE INDEX idx_arms_school_class
    ON arms (school_id, class_id);
