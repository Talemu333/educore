CREATE TABLE IF NOT EXISTS eduprow_partners (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(40) NOT NULL,
    location VARCHAR(150),
    password_hash TEXT NOT NULL,
    referral_code VARCHAR(40) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eduprow_partner_leads (
    id BIGSERIAL PRIMARY KEY,
    partner_id BIGINT NOT NULL REFERENCES eduprow_partners(id) ON DELETE CASCADE,
    school_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(150),
    phone VARCHAR(40),
    email VARCHAR(255),
    location VARCHAR(150),
    student_count INTEGER,
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'contacted', 'demo_scheduled', 'demo_completed', 'negotiation', 'converted', 'lost')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eduprow_partner_commissions (
    id BIGSERIAL PRIMARY KEY,
    partner_id BIGINT NOT NULL REFERENCES eduprow_partners(id) ON DELETE CASCADE,
    lead_id BIGINT REFERENCES eduprow_partner_leads(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    eligible_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eduprow_partner_settings (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    programme_name VARCHAR(100) NOT NULL DEFAULT 'EduProw Partner Programme',
    commission_type VARCHAR(20) NOT NULL DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
    commission_rate NUMERIC(8,2),
    commission_fixed_amount NUMERIC(12,2),
    commission_eligibility TEXT NOT NULL DEFAULT 'Commission becomes eligible after EduProw confirms payment from a referred school.',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO eduprow_partner_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_eduprow_partner_leads_partner_id ON eduprow_partner_leads(partner_id);
CREATE INDEX IF NOT EXISTS idx_eduprow_partner_leads_status ON eduprow_partner_leads(status);
CREATE INDEX IF NOT EXISTS idx_eduprow_partner_commissions_partner_id ON eduprow_partner_commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_eduprow_partner_commissions_status ON eduprow_partner_commissions(status);
