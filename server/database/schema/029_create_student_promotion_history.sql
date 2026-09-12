CREATE TABLE student_promotion_history (

    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    student_id INTEGER NOT NULL,

    from_session_id INTEGER NOT NULL,

    to_session_id INTEGER,

    from_class_id INTEGER NOT NULL,

    to_class_id INTEGER,

    from_arm_id INTEGER,

    to_arm_id INTEGER,

    action VARCHAR(20) NOT NULL,

    remarks TEXT,

    processed_by INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_promotion_history_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_promotion_history_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_promotion_history_from_session
        FOREIGN KEY (from_session_id)
        REFERENCES academic_sessions(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_promotion_history_to_session
        FOREIGN KEY (to_session_id)
        REFERENCES academic_sessions(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_promotion_history_from_class
        FOREIGN KEY (from_class_id)
        REFERENCES classes(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_promotion_history_to_class
        FOREIGN KEY (to_class_id)
        REFERENCES classes(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_promotion_history_from_arm
        FOREIGN KEY (from_arm_id)
        REFERENCES arms(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_promotion_history_to_arm
        FOREIGN KEY (to_arm_id)
        REFERENCES arms(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_promotion_history_processed_by
        FOREIGN KEY (processed_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_promotion_history_action
        CHECK (action IN ('Promoted', 'Repeated', 'Graduated'))
);

CREATE INDEX idx_promotion_history_school_id
    ON student_promotion_history (school_id);

CREATE INDEX idx_promotion_history_student_id
    ON student_promotion_history (student_id);
