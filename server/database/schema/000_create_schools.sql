CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY,
    school_name VARCHAR(150) NOT NULL,
    school_code VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(30),
    address TEXT,
    logo TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_schools_school_code
    ON schools (school_code)
    WHERE school_code IS NOT NULL;
