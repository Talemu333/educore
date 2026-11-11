-- Keep source links tenant-safe without preventing deletion of reusable bank items.
BEGIN;
ALTER TABLE cbt_questions DROP CONSTRAINT IF EXISTS fk_cbt_questions_bank_source_school;
ALTER TABLE cbt_questions
    ADD CONSTRAINT fk_cbt_questions_bank_source_school
    FOREIGN KEY (question_bank_id, school_id)
    REFERENCES cbt_question_bank(id, school_id)
    ON DELETE SET NULL (question_bank_id);
COMMIT;
