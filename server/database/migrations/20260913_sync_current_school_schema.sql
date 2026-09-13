-- Reconcile existing isolated school databases with the current production
-- school schema. The current production reference is educoreDb(1).sql.
-- This migration is intentionally idempotent.

ALTER TABLE schools
    ADD COLUMN IF NOT EXISTS logo TEXT;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS admin_type VARCHAR(20);

ALTER TABLE departments
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE departments
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

ALTER TABLE departments
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE subjects
    ADD COLUMN IF NOT EXISTS is_core BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT TRUE;

ALTER TABLE fee_types
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE fee_types
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

ALTER TABLE fee_types
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE student_results
    ADD COLUMN IF NOT EXISTS "position" INTEGER;

ALTER TABLE student_promotion_history
    ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE timetables
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE timetables
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

ALTER TABLE timetables
    ALTER COLUMN school_id SET NOT NULL;

-- The old dedicated-school schema had this column, but the current production
-- schema does not. Parent/student relationships are represented by
-- student_parents.relationship_id.
ALTER TABLE parents
    DROP COLUMN IF EXISTS relationship_to_student;

-- The old dedicated-school schema enforced CA/exam maximums directly on
-- student_results. The current production schema intentionally only requires
-- non-negative CA/exam values; school_settings stores the configured maxima.
-- Reconcile every CHECK constraint to the current production definitions so
-- legacy constraints cannot block valid production rows during migration.

ALTER TABLE academic_sessions DROP CONSTRAINT IF EXISTS chk_session_dates;
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS chk_attendance_status;
ALTER TABLE cbt_answers DROP CONSTRAINT IF EXISTS cbt_answers_marks_awarded_check;
ALTER TABLE cbt_attempt_questions DROP CONSTRAINT IF EXISTS cbt_attempt_questions_question_order_check;
ALTER TABLE cbt_attempts DROP CONSTRAINT IF EXISTS cbt_attempts_attempt_number_check;
ALTER TABLE cbt_attempts DROP CONSTRAINT IF EXISTS cbt_attempts_correct_answers_check;
ALTER TABLE cbt_attempts DROP CONSTRAINT IF EXISTS cbt_attempts_percentage_check;
ALTER TABLE cbt_attempts DROP CONSTRAINT IF EXISTS cbt_attempts_score_check;
ALTER TABLE cbt_attempts DROP CONSTRAINT IF EXISTS cbt_attempts_status_check;
ALTER TABLE cbt_attempts DROP CONSTRAINT IF EXISTS cbt_attempts_unanswered_check;
ALTER TABLE cbt_attempts DROP CONSTRAINT IF EXISTS cbt_attempts_wrong_answers_check;
ALTER TABLE cbt_exams DROP CONSTRAINT IF EXISTS cbt_exam_dates_check;
ALTER TABLE cbt_exams DROP CONSTRAINT IF EXISTS cbt_exams_duration_minutes_check;
ALTER TABLE cbt_exams DROP CONSTRAINT IF EXISTS cbt_exams_max_attempts_check;
ALTER TABLE cbt_exams DROP CONSTRAINT IF EXISTS cbt_exams_pass_mark_check;
ALTER TABLE cbt_exams DROP CONSTRAINT IF EXISTS cbt_exams_question_selection_count_check;
ALTER TABLE cbt_exams DROP CONSTRAINT IF EXISTS cbt_exams_status_check;
ALTER TABLE cbt_exams DROP CONSTRAINT IF EXISTS cbt_exams_total_marks_check;
ALTER TABLE cbt_question_bank DROP CONSTRAINT IF EXISTS cbt_question_bank_marks_check;
ALTER TABLE cbt_question_bank_options DROP CONSTRAINT IF EXISTS cbt_question_bank_options_option_order_check;
ALTER TABLE cbt_question_options DROP CONSTRAINT IF EXISTS cbt_question_options_option_order_check;
ALTER TABLE cbt_questions DROP CONSTRAINT IF EXISTS cbt_questions_marks_check;
ALTER TABLE cbt_questions DROP CONSTRAINT IF EXISTS cbt_questions_question_order_check;
ALTER TABLE classes DROP CONSTRAINT IF EXISTS chk_class_level;
ALTER TABLE contact_messages DROP CONSTRAINT IF EXISTS contact_messages_status_check;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_amount_check;
ALTER TABLE grading_systems DROP CONSTRAINT IF EXISTS chk_grading_max_score;
ALTER TABLE grading_systems DROP CONSTRAINT IF EXISTS chk_grading_min_score;
ALTER TABLE student_enrollments DROP CONSTRAINT IF EXISTS chk_enrollment_status;
ALTER TABLE student_promotion_history DROP CONSTRAINT IF EXISTS chk_promotion_action;
ALTER TABLE student_results DROP CONSTRAINT IF EXISTS chk_ca_non_negative;
ALTER TABLE student_results DROP CONSTRAINT IF EXISTS chk_exam_non_negative;
ALTER TABLE student_results DROP CONSTRAINT IF EXISTS chk_total;
ALTER TABLE student_results DROP CONSTRAINT IF EXISTS chk_total_score;
ALTER TABLE teachers DROP CONSTRAINT IF EXISTS chk_teacher_marital_status;
ALTER TABLE terms DROP CONSTRAINT IF EXISTS chk_term_dates;
ALTER TABLE terms DROP CONSTRAINT IF EXISTS chk_term_name;
ALTER TABLE timetables DROP CONSTRAINT IF EXISTS chk_day;
ALTER TABLE timetables DROP CONSTRAINT IF EXISTS chk_time;

ALTER TABLE academic_sessions ADD CONSTRAINT chk_session_dates CHECK ((end_date > start_date));
ALTER TABLE attendance ADD CONSTRAINT chk_attendance_status CHECK (((status)::text = ANY ((ARRAY['PRESENT'::character varying, 'ABSENT'::character varying, 'LATE'::character varying, 'EXCUSED'::character varying])::text[])));
ALTER TABLE cbt_answers ADD CONSTRAINT cbt_answers_marks_awarded_check CHECK ((marks_awarded >= (0)::numeric));
ALTER TABLE cbt_attempt_questions ADD CONSTRAINT cbt_attempt_questions_question_order_check CHECK ((question_order > 0));
ALTER TABLE cbt_attempts ADD CONSTRAINT cbt_attempts_attempt_number_check CHECK ((attempt_number > 0));
ALTER TABLE cbt_attempts ADD CONSTRAINT cbt_attempts_correct_answers_check CHECK ((correct_answers >= 0));
ALTER TABLE cbt_attempts ADD CONSTRAINT cbt_attempts_percentage_check CHECK (((percentage >= (0)::numeric) AND (percentage <= (100)::numeric)));
ALTER TABLE cbt_attempts ADD CONSTRAINT cbt_attempts_score_check CHECK ((score >= (0)::numeric));
ALTER TABLE cbt_attempts ADD CONSTRAINT cbt_attempts_status_check CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'submitted'::character varying, 'expired'::character varying])::text[])));
ALTER TABLE cbt_attempts ADD CONSTRAINT cbt_attempts_unanswered_check CHECK ((unanswered >= 0));
ALTER TABLE cbt_attempts ADD CONSTRAINT cbt_attempts_wrong_answers_check CHECK ((wrong_answers >= 0));
ALTER TABLE cbt_exams ADD CONSTRAINT cbt_exam_dates_check CHECK (((ends_at IS NULL) OR (starts_at IS NULL) OR (ends_at > starts_at)));
ALTER TABLE cbt_exams ADD CONSTRAINT cbt_exams_duration_minutes_check CHECK ((duration_minutes > 0));
ALTER TABLE cbt_exams ADD CONSTRAINT cbt_exams_max_attempts_check CHECK ((max_attempts > 0));
ALTER TABLE cbt_exams ADD CONSTRAINT cbt_exams_pass_mark_check CHECK ((pass_mark >= (0)::numeric));
ALTER TABLE cbt_exams ADD CONSTRAINT cbt_exams_question_selection_count_check CHECK ((question_selection_count >= 0));
ALTER TABLE cbt_exams ADD CONSTRAINT cbt_exams_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'closed'::character varying])::text[])));
ALTER TABLE cbt_exams ADD CONSTRAINT cbt_exams_total_marks_check CHECK ((total_marks >= (0)::numeric));
ALTER TABLE cbt_question_bank ADD CONSTRAINT cbt_question_bank_marks_check CHECK ((marks > (0)::numeric));
ALTER TABLE cbt_question_bank_options ADD CONSTRAINT cbt_question_bank_options_option_order_check CHECK ((option_order > 0));
ALTER TABLE cbt_question_options ADD CONSTRAINT cbt_question_options_option_order_check CHECK ((option_order > 0));
ALTER TABLE cbt_questions ADD CONSTRAINT cbt_questions_marks_check CHECK ((marks > (0)::numeric));
ALTER TABLE cbt_questions ADD CONSTRAINT cbt_questions_question_order_check CHECK ((question_order > 0));
ALTER TABLE classes ADD CONSTRAINT chk_class_level CHECK (((class_level)::text = ANY ((ARRAY['Nursery'::character varying, 'Primary'::character varying, 'Junior'::character varying, 'Senior'::character varying])::text[])));
ALTER TABLE contact_messages ADD CONSTRAINT contact_messages_status_check CHECK (((status)::text = ANY ((ARRAY['unread'::character varying, 'read'::character varying, 'responded'::character varying])::text[])));
ALTER TABLE expenses ADD CONSTRAINT expenses_amount_check CHECK ((amount > (0)::numeric));
ALTER TABLE grading_systems ADD CONSTRAINT chk_grading_max_score CHECK (((max_score IS NULL) OR ((max_score >= (0)::numeric) AND (max_score <= (100)::numeric))));
ALTER TABLE grading_systems ADD CONSTRAINT chk_grading_min_score CHECK (((min_score >= (0)::numeric) AND (min_score <= (100)::numeric)));
ALTER TABLE student_enrollments ADD CONSTRAINT chk_enrollment_status CHECK (((enrollment_status)::text = ANY ((ARRAY['Active'::character varying, 'Promoted'::character varying, 'Graduated'::character varying, 'Transferred'::character varying, 'Withdrawn'::character varying])::text[])));
ALTER TABLE student_promotion_history ADD CONSTRAINT chk_promotion_action CHECK (((action)::text = ANY ((ARRAY['Promoted'::character varying, 'Repeated'::character varying, 'Graduated'::character varying])::text[])));
ALTER TABLE student_results ADD CONSTRAINT chk_ca_non_negative CHECK ((ca_score >= (0)::numeric));
ALTER TABLE student_results ADD CONSTRAINT chk_exam_non_negative CHECK ((exam_score >= (0)::numeric));
ALTER TABLE student_results ADD CONSTRAINT chk_total CHECK (((total_score >= (0)::numeric) AND (total_score <= (100)::numeric)));
ALTER TABLE student_results ADD CONSTRAINT chk_total_score CHECK (((total_score >= (0)::numeric) AND (total_score <= (100)::numeric)));
ALTER TABLE teachers ADD CONSTRAINT chk_teacher_marital_status CHECK (((marital_status)::text = ANY ((ARRAY['Single'::character varying, 'Married'::character varying, 'Divorced'::character varying, 'Widowed'::character varying])::text[])));
ALTER TABLE terms ADD CONSTRAINT chk_term_dates CHECK ((end_date > start_date));
ALTER TABLE terms ADD CONSTRAINT chk_term_name CHECK (((term_name)::text = ANY ((ARRAY['First Term'::character varying, 'Second Term'::character varying, 'Third Term'::character varying])::text[])));
ALTER TABLE timetables ADD CONSTRAINT chk_day CHECK (((day_of_week)::text = ANY ((ARRAY['Monday'::character varying, 'Tuesday'::character varying, 'Wednesday'::characterizing varying, 'Thursday'::character varying, 'Friday'::character varying, 'Saturday'::character varying, 'Sunday'::character varying])));
ALTER TABLE timetables ADD CONSTRAINT chk_time CHECK ((end_time > start_time));

-- Restore the current production ARM uniqueness rule. The old dedicated schema
-- incorrectly made arm names unique across the whole school.
ALTER TABLE arms DROP CONSTRAINT IF EXISTS uq_school_arm_name;
ALTER TABLE arms ADD CONSTRAINT uq_class_arm UNIQUE (class_id, arm_name);
