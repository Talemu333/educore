CREATE TABLE parents (

    id SERIAL PRIMARY KEY,

    user_id INTEGER UNIQUE,

    surname VARCHAR(100) NOT NULL,

    first_name VARCHAR(100) NOT NULL,

    middle_name VARCHAR(100),

    gender VARCHAR(10),

    phone_number VARCHAR(20) NOT NULL,

    alternate_phone VARCHAR(20),

    email VARCHAR(100),

    occupation VARCHAR(100),

    residential_address TEXT NOT NULL,

    relationship_to_student VARCHAR(30) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_parent_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);