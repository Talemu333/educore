CREATE TABLE testimonials (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    author_name VARCHAR(150) NOT NULL,
    author_role VARCHAR(120),
    testimonial_text TEXT NOT NULL,
    image_url TEXT,
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_testimonials_school_published_order ON testimonials (school_id, is_published, display_order, id);

CREATE TABLE school_facilities (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    facility_name VARCHAR(180) NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_school_facilities_school_published_order ON school_facilities (school_id, is_published, display_order, id);

CREATE TABLE school_core_values (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    value_title VARCHAR(150) NOT NULL,
    description TEXT,
    icon VARCHAR(80),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_school_core_values_school_published_order ON school_core_values (school_id, is_published, display_order, id);
