CREATE TABLE announcements (

    id SERIAL PRIMARY KEY,

    title VARCHAR(200) NOT NULL,

    message TEXT NOT NULL,

    audience VARCHAR(50) NOT NULL DEFAULT 'all',

    created_by INTEGER REFERENCES users(id),

    is_active BOOLEAN DEFAULT TRUE,

    publish_date DATE DEFAULT CURRENT_DATE,

    expiry_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);