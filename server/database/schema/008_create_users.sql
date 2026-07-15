CREATE TABLE users (

    id SERIAL PRIMARY KEY,

    role_id INTEGER NOT NULL,

    username VARCHAR(50) NOT NULL UNIQUE,

    email VARCHAR(100) UNIQUE,

    password VARCHAR(255) NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    last_login TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT
);