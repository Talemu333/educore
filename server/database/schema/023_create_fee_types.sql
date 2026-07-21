CREATE TABLE fee_types (

    id SERIAL PRIMARY KEY,

    fee_name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);