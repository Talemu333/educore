BEGIN;

ALTER TABLE eduprow_partner_leads
    ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_eduprow_partner_leads_converted_at
    ON eduprow_partner_leads(converted_at);

COMMIT;
