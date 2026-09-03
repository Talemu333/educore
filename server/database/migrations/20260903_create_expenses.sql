BEGIN;

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES school_settings(id) ON DELETE CASCADE,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH',
    vendor VARCHAR(150),
    reference_number VARCHAR(100),
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_school_date
    ON expenses (school_id, expense_date DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_school_category
    ON expenses (school_id, category);

CREATE INDEX IF NOT EXISTS idx_expenses_school_created_by
    ON expenses (school_id, created_by);

COMMIT;
