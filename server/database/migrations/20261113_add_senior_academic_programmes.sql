-- Senior secondary academic programmes and student-specific subject enrolment.
-- This migration is applied to every isolated school database by the provisioning
-- migration runner. Existing class_subjects and academic records are untouched.

BEGIN;

CREATE TABLE IF NOT EXISTS academic_programmes (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    programme_name VARCHAR(100) NOT NULL,
    programme_code VARCHAR(30),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_academic_programme_name UNIQUE (school_id, class_id, programme_name),
    CONSTRAINT uq_academic_programme_id_school UNIQUE (id, school_id)
);

CREATE TABLE IF NOT EXISTS academic_programme_subjects (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    programme_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    is_compulsory BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_programme_subject UNIQUE (programme_id, subject_id),
    CONSTRAINT fk_programme_subject_programme
        FOREIGN KEY (programme_id, school_id)
        REFERENCES academic_programmes(id, school_id) ON DELETE CASCADE,
    CONSTRAINT fk_programme_subject_subject
        FOREIGN KEY (subject_id, school_id)
        REFERENCES subjects(id, school_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS student_programme_enrollments (
    id BIGSERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    session_id INTEGER NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    programme_id INTEGER NOT NULL,
    assigned_by INTEGER,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active', 'Ended')),
    CONSTRAINT fk_student_programme_programme
        FOREIGN KEY (programme_id, school_id)
        REFERENCES academic_programmes(id, school_id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_student_programme_active_session
    ON student_programme_enrollments (student_id, session_id)
    WHERE status = 'Active';

CREATE INDEX IF NOT EXISTS idx_student_programme_school_session
    ON student_programme_enrollments (school_id, session_id, class_id, programme_id)
    WHERE status = 'Active';

CREATE TABLE IF NOT EXISTS student_subject_enrollments (
    id BIGSERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    session_id INTEGER NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    programme_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active', 'Ended')),
    CONSTRAINT fk_student_subject_programme
        FOREIGN KEY (programme_id, school_id)
        REFERENCES academic_programmes(id, school_id) ON DELETE RESTRICT,
    CONSTRAINT fk_student_subject_offering
        FOREIGN KEY (programme_id, subject_id)
        REFERENCES academic_programme_subjects(programme_id, subject_id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_student_subject_active_session
    ON student_subject_enrollments (student_id, session_id, subject_id)
    WHERE status = 'Active';

CREATE INDEX IF NOT EXISTS idx_student_subject_school_session
    ON student_subject_enrollments (school_id, session_id, class_id, subject_id)
    WHERE status = 'Active';

CREATE INDEX IF NOT EXISTS idx_student_subject_student_session
    ON student_subject_enrollments (student_id, session_id, status);

COMMIT;
