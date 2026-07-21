CREATE TABLE student_enrollments (

    id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL,

    session_id INTEGER NOT NULL,

    class_id INTEGER NOT NULL,

    arm_id INTEGER,

    enrollment_date DATE NOT NULL,

    enrollment_status VARCHAR(20)
        DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_enrollment_student
        FOREIGN KEY(student_id)
        REFERENCES students(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_enrollment_session
        FOREIGN KEY(session_id)
        REFERENCES academic_sessions(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_enrollment_class
        FOREIGN KEY(class_id)
        REFERENCES classes(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_enrollment_arm
        FOREIGN KEY(arm_id)
        REFERENCES arms(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_enrollment_status
        CHECK (
            enrollment_status IN
            (
                'Active',
                'Promoted',
                'Graduated',
                'Transferred',
                'Withdrawn'
            )
        ),

    CONSTRAINT uq_student_session
        UNIQUE(student_id, session_id)

);