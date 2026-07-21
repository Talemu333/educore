CREATE TABLE teacher_assignments (

    id SERIAL PRIMARY KEY,

    teacher_id INTEGER NOT NULL,

    subject_id INTEGER NOT NULL,

    class_id INTEGER NOT NULL,

    arm_id INTEGER,

    session_id INTEGER NOT NULL,

    term_id INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignment_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES teachers(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_assignment_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_assignment_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_assignment_arm
        FOREIGN KEY (arm_id)
        REFERENCES arms(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_assignment_session
        FOREIGN KEY (session_id)
        REFERENCES academic_sessions(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_assignment_term
        FOREIGN KEY (term_id)
        REFERENCES terms(id)
        ON DELETE RESTRICT,
    
    CONSTRAINT uq_teacher_assignment
        UNIQUE (
        teacher_id,
        subject_id,
        class_id,
        arm_id,
        session_id,
        term_id
    );
);