CREATE TABLE users (

    id SERIAL PRIMARY KEY,

    role_id INTEGER NOT NULL,

    school_id INTEGER,

    username VARCHAR(50) NOT NULL UNIQUE,

    email VARCHAR(100) UNIQUE,

    password VARCHAR(255) NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    last_login TIMESTAMP,

    password_reset_token_hash TEXT,

    password_reset_expires_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_user_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_users_school_id
    ON users (school_id);
