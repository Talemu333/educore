CREATE TABLE grading_systems (

    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    grade VARCHAR(10) NOT NULL,

    min_score NUMERIC(5,2) NOT NULL,

    max_score NUMERIC(5,2) NOT NULL,

    remark VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_grading_system_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_grading_system_score_range
        CHECK (min_score >= 0 AND max_score <= 100 AND min_score <= max_score)
);

CREATE INDEX idx_grading_systems_school_id
    ON grading_systems (school_id);
