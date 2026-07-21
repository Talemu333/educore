CREATE TABLE attendance (

    id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL,

    session_id INTEGER NOT NULL,

    term_id INTEGER NOT NULL,

    class_id INTEGER NOT NULL,

    arm_id INTEGER,

    attendance_date DATE NOT NULL,

    status VARCHAR(10) NOT NULL,

    marked_by INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attendance_student
        FOREIGN KEY(student_id)
        REFERENCES students(id),

    CONSTRAINT fk_attendance_session
        FOREIGN KEY(session_id)
        REFERENCES academic_sessions(id),

    CONSTRAINT fk_attendance_term
        FOREIGN KEY(term_id)
        REFERENCES terms(id),

    CONSTRAINT fk_attendance_class
        FOREIGN KEY(class_id)
        REFERENCES classes(id),

    CONSTRAINT fk_attendance_arm
        FOREIGN KEY(arm_id)
        REFERENCES arms(id),

    CONSTRAINT fk_marked_by
        FOREIGN KEY(marked_by)
        REFERENCES users(id),

    CONSTRAINT chk_attendance_status
        CHECK (

            status IN (

                'PRESENT',

                'ABSENT',

                'LATE',

                'EXCUSED'

            )

        ),

    CONSTRAINT uq_daily_attendance

        UNIQUE(

            student_id,

            attendance_date

        )

);