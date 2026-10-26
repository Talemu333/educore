-- Class teacher assignment foundation for weekly and periodic student progress reports.
-- Apply this migration to each school database. The table is tenant-scoped and
-- references the existing school-local teacher, class, arm, and academic-session records.

BEGIN;

CREATE TABLE IF NOT EXISTS class_teacher_assignments (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    arm_id INTEGER REFERENCES arms(id) ON DELETE RESTRICT,
    session_id INTEGER NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- A class/arm can have only one active class teacher in a given session.
-- COALESCE makes NULL arm assignments (classes without arms) participate in
-- the uniqueness rule as well.
CREATE UNIQUE INDEX IF NOT EXISTS uq_class_teacher_active_class_session
    ON class_teacher_assignments (
        school_id,
        class_id,
        COALESCE(arm_id, 0),
        session_id
    )
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_class_teacher_assignments_teacher
    ON class_teacher_assignments (school_id, teacher_id, session_id)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_class_teacher_assignments_class
    ON class_teacher_assignments (school_id, class_id, arm_id, session_id)
    WHERE is_active = TRUE;

COMMIT;
