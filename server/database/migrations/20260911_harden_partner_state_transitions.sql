BEGIN;

CREATE OR REPLACE FUNCTION prevent_invalid_partner_commission_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'pending' AND NEW.status NOT IN ('approved', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid commission transition from pending to %', NEW.status;
    ELSIF OLD.status = 'approved' AND NEW.status NOT IN ('paid', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid commission transition from approved to %', NEW.status;
    ELSIF OLD.status IN ('paid', 'cancelled') AND NEW.status <> OLD.status THEN
        RAISE EXCEPTION 'Commission in % status cannot be changed', OLD.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_partner_commission_status_transition
    ON eduprow_partner_commissions;

CREATE TRIGGER trg_partner_commission_status_transition
BEFORE UPDATE OF status ON eduprow_partner_commissions
FOR EACH ROW
EXECUTE FUNCTION prevent_invalid_partner_commission_transition();

CREATE OR REPLACE FUNCTION prevent_invalid_partner_lead_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'converted' AND NEW.status <> 'converted'
       AND EXISTS (
           SELECT 1
           FROM eduprow_partner_commissions c
           WHERE c.lead_id = OLD.id
       ) THEN
        RAISE EXCEPTION 'A converted lead with a commission cannot leave converted status';
    END IF;

    IF OLD.status = 'converted' AND NEW.status = 'converted'
       AND OLD.school_id IS NOT NULL
       AND NEW.school_id IS DISTINCT FROM OLD.school_id THEN
        RAISE EXCEPTION 'A converted lead cannot be reassigned to another school';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_partner_lead_state_transition
    ON eduprow_partner_leads;

CREATE TRIGGER trg_partner_lead_state_transition
BEFORE UPDATE OF status, school_id ON eduprow_partner_leads
FOR EACH ROW
EXECUTE FUNCTION prevent_invalid_partner_lead_transition();

COMMIT;
