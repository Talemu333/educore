CREATE TABLE school_settings (

    id SERIAL PRIMARY KEY,

    school_name VARCHAR(150) NOT NULL,

    admission_prefix VARCHAR(20) NOT NULL,

    school_email VARCHAR(100),

    school_phone VARCHAR(20),

    school_address TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);