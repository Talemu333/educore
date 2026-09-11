BEGIN;

ALTER TABLE eduprow_partner_leads
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_eduprow_partner_lead_school'
          AND conrelid = 'eduprow_partner_leads'::regclass
    ) THEN
        ALTER TABLE eduprow_partner_leads
            ADD CONSTRAINT fk_eduprow_partner_lead_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_eduprow_partner_leads_school_id
    ON eduprow_partner_leads(school_id);

ALTER TABLE eduprow_partner_commissions
    ADD COLUMN IF NOT EXISTS payment_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_eduprow_partner_commission_payment'
          AND conrelid = 'eduprow_partner_commissions'::regclass
    ) THEN
        ALTER TABLE eduprow_partner_commissions
            ADD CONSTRAINT fk_eduprow_partner_commission_payment
            FOREIGN KEY (payment_id)
            REFERENCES student_payments(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_eduprow_partner_commissions_lead
    ON eduprow_partner_commissions(lead_id)
    WHERE lead_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_eduprow_partner_commissions_payment
    ON eduprow_partner_commissions(payment_id)
    WHERE payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_eduprow_partner_commissions_payment_id
    ON eduprow_partner_commissions(payment_id);

COMMIT;
