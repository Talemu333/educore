CREATE TABLE website_pages (

    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    page_slug VARCHAR(180) NOT NULL,

    page_title VARCHAR(200) NOT NULL,

    page_content TEXT NOT NULL DEFAULT '',

    meta_title VARCHAR(255),

    meta_description TEXT,

    is_published BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_website_page_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_website_page_school_slug
        UNIQUE (school_id, page_slug)
);

CREATE INDEX idx_website_pages_school_id
    ON website_pages (school_id);

CREATE TABLE website_sections (

    id SERIAL PRIMARY KEY,

    page_id INTEGER NOT NULL,

    school_id INTEGER NOT NULL,

    section_key VARCHAR(100),

    section_title VARCHAR(255) NOT NULL,

    section_subtitle VARCHAR(255),

    section_content TEXT,

    image_url TEXT,

    button_text VARCHAR(100),

    button_url TEXT,

    display_order INTEGER NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_website_section_page
        FOREIGN KEY (page_id)
        REFERENCES website_pages(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_website_section_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_website_sections_page_id
    ON website_sections (page_id);

CREATE INDEX idx_website_sections_school_id
    ON website_sections (school_id);

CREATE TABLE news (

    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,

    slug VARCHAR(180) NOT NULL,

    excerpt TEXT,

    content TEXT NOT NULL,

    image_url TEXT,

    author VARCHAR(150),

    published_at TIMESTAMP,

    is_published BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_news_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_news_school_slug
        UNIQUE (school_id, slug)
);

CREATE INDEX idx_news_school_id
    ON news (school_id);

CREATE TABLE events (

    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,

    slug VARCHAR(180) NOT NULL,

    description TEXT,

    content TEXT,

    image_url TEXT,

    event_date DATE NOT NULL,

    start_time TIME,

    end_time TIME,

    venue VARCHAR(255),

    organizer VARCHAR(150),

    is_published BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_events_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_events_school_slug
        UNIQUE (school_id, slug)
);

CREATE INDEX idx_events_school_id
    ON events (school_id);

CREATE TABLE gallery (

    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,

    description TEXT,

    image_url TEXT NOT NULL,

    category VARCHAR(100),

    display_order INTEGER NOT NULL DEFAULT 0,

    is_published BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_gallery_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_gallery_school_id
    ON gallery (school_id);
