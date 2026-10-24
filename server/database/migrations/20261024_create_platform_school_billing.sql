BEGIN;

CREATE TABLE IF NOT EXISTS platform_school_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    plan_name TEXT NOT NULL,
    student_count INTEGER NOT NULL CHECK (student_count > 0),
    rate_per_student NUMERIC(12,2) NOT NULL CHECK (rate_per_student >= 0),
    amount_due NUMERIC(14,2) NOT NULL CHECK (amount_due >= 0),
    billing_period TEXT NOT NULL,
    start_date DATE,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','expired','cancelled')),
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_platform_school_subscriptions_school
    ON platform_school_subscriptions (school_id, created_at DESC);

CREATE TABLE IF NOT EXISTS platform_school_payments (
    id BIGSERIAL PRIMARY KEY,
    subscription_id BIGINT NOT NULL REFERENCES platform_school_subscriptions(id) ON DELETE RESTRICT,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer','cash','card','pos','other')),
    reference TEXT,
    notes TEXT,
    recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_platform_school_payments_school
    ON platform_school_payments (school_id, payment_date DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_platform_school_payments_subscription
    ON platform_school_payments (subscription_id, payment_date DESC);

COMMIT;