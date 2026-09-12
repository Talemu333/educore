CREATE TABLE school_settings (

    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    school_name VARCHAR(150) NOT NULL,

    admission_prefix VARCHAR(20) NOT NULL,

    school_email VARCHAR(100),

    school_phone VARCHAR(20),

    school_address TEXT,

    school_motto TEXT,

    school_level VARCHAR(50),

    website_slug VARCHAR(180),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_school_settings_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_school_settings_school_id
        UNIQUE (school_id),

    CONSTRAINT uq_school_settings_website_slug
        UNIQUE (website_slug)
);

CREATE INDEX idx_school_settings_school_id
    ON school_settings (school_id);
