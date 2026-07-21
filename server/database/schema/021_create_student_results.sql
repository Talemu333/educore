CREATE TABLE student_results (

    id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL,

    teacher_assignment_id INTEGER NOT NULL,

    session_id INTEGER NOT NULL,

    term_id INTEGER NOT NULL,

    ca_score NUMERIC(5,2) NOT NULL DEFAULT 0,

    exam_score NUMERIC(5,2) NOT NULL DEFAULT 0,

    total_score NUMERIC(5,2) NOT NULL,

    grade VARCHAR(2),

    remark VARCHAR(30),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_result_student
        FOREIGN KEY(student_id)
        REFERENCES students(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_result_assignment
        FOREIGN KEY(teacher_assignment_id)
        REFERENCES teacher_assignments(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_result_session
        FOREIGN KEY(session_id)
        REFERENCES academic_sessions(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_result_term
        FOREIGN KEY(term_id)
        REFERENCES terms(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_ca
        CHECK (ca_score >= 0 AND ca_score <= 30),

    CONSTRAINT chk_exam
        CHECK (exam_score >= 0 AND exam_score <= 70),

    CONSTRAINT chk_total
        CHECK (total_score >= 0 AND total_score <= 100),

    CONSTRAINT uq_result
        UNIQUE(
            student_id,
            teacher_assignment_id,
            session_id,
            term_id
        )
);