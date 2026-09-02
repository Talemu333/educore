BEGIN;

-- Website content is tenant-owned. The application already scopes reads and
-- writes by school_id, but legacy website tables may still have global slug
-- uniqueness or missing school_id values. This migration completes that
-- boundary and makes the default pages available to every active school.

-- -------------------------------------------------------------------------
-- WEBSITE PAGES
-- -------------------------------------------------------------------------
ALTER TABLE website_pages
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

-- Legacy website content belongs to the original/demo school.
UPDATE website_pages
SET school_id = 1
WHERE school_id IS NULL;

ALTER TABLE website_pages
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE website_pages
    DROP CONSTRAINT IF EXISTS website_pages_page_slug_key;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_website_page_school'
          AND conrelid = 'website_pages'::regclass
    ) THEN
        ALTER TABLE website_pages
            ADD CONSTRAINT fk_website_page_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_website_page_school_slug'
          AND conrelid = 'website_pages'::regclass
    ) THEN
        ALTER TABLE website_pages
            ADD CONSTRAINT uq_website_page_school_slug
            UNIQUE (school_id, page_slug);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_website_pages_school_id
    ON website_pages(school_id);

-- -------------------------------------------------------------------------
-- WEBSITE SECTIONS
-- -------------------------------------------------------------------------
ALTER TABLE website_sections
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE website_sections ws
SET school_id = wp.school_id
FROM website_pages wp
WHERE ws.page_id = wp.id
  AND ws.school_id IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM website_sections WHERE school_id IS NULL) THEN
        RAISE EXCEPTION 'website_sections contains rows that cannot be assigned to a school';
    END IF;
END $$;

ALTER TABLE website_sections
    ALTER COLUMN school_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_website_section_school'
          AND conrelid = 'website_sections'::regclass
    ) THEN
        ALTER TABLE website_sections
            ADD CONSTRAINT fk_website_section_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_website_sections_school_id
    ON website_sections(school_id);

-- -------------------------------------------------------------------------
-- NEWS
-- -------------------------------------------------------------------------
ALTER TABLE news
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE news
SET school_id = 1
WHERE school_id IS NULL;

ALTER TABLE news
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE news
    DROP CONSTRAINT IF EXISTS news_slug_key;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_news_school'
          AND conrelid = 'news'::regclass
    ) THEN
        ALTER TABLE news
            ADD CONSTRAINT fk_news_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_news_school_slug'
          AND conrelid = 'news'::regclass
    ) THEN
        ALTER TABLE news
            ADD CONSTRAINT uq_news_school_slug
            UNIQUE (school_id, slug);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_news_school_id
    ON news(school_id);

-- -------------------------------------------------------------------------
-- EVENTS
-- -------------------------------------------------------------------------
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE events
SET school_id = 1
WHERE school_id IS NULL;

ALTER TABLE events
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE events
    DROP CONSTRAINT IF EXISTS events_slug_key;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_events_school'
          AND conrelid = 'events'::regclass
    ) THEN
        ALTER TABLE events
            ADD CONSTRAINT fk_events_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_events_school_slug'
          AND conrelid = 'events'::regclass
    ) THEN
        ALTER TABLE events
            ADD CONSTRAINT uq_events_school_slug
            UNIQUE (school_id, slug);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_school_id
    ON events(school_id);

-- -------------------------------------------------------------------------
-- GALLERY
-- -------------------------------------------------------------------------
ALTER TABLE gallery
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE gallery
SET school_id = 1
WHERE school_id IS NULL;

ALTER TABLE gallery
    ALTER COLUMN school_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_gallery_school'
          AND conrelid = 'gallery'::regclass
    ) THEN
        ALTER TABLE gallery
            ADD CONSTRAINT fk_gallery_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_gallery_school_id
    ON gallery(school_id);

-- -------------------------------------------------------------------------
-- DEFAULT WEBSITE PAGES FOR EVERY ACTIVE SCHOOL
-- -------------------------------------------------------------------------
INSERT INTO website_pages (
    school_id,
    page_slug,
    page_title,
    page_content,
    meta_title,
    meta_description,
    is_published
)
SELECT
    s.id,
    defaults.page_slug,
    defaults.page_title,
    defaults.page_content,
    defaults.meta_title,
    defaults.meta_description,
    TRUE
FROM schools s
CROSS JOIN (
    VALUES
        ('home', 'Welcome to Our School', 'We are committed to providing quality education and helping every learner grow in knowledge, character and confidence.', 'Home', 'Welcome to our school.'),
        ('about', 'About Us', 'Learn more about our school, our values and our commitment to providing a supportive learning environment.', 'About Us', 'Learn more about our school.'),
        ('academics', 'Academics', 'Explore our academic programmes and the learning opportunities available to our students.', 'Academics', 'Explore our academic programmes.'),
        ('admissions', 'Admissions', 'Learn about our admission process and how to begin your journey with our school.', 'Admissions', 'Learn about our admission process.'),
        ('contact', 'Contact Us', 'Get in touch with our school for enquiries, admissions and other information.', 'Contact Us', 'Get in touch with our school.'),
        ('news', 'News', 'Stay updated with the latest news, announcements and stories from our school.', 'School News', 'Read the latest news and announcements from our school.'),
        ('gallery', 'Gallery', 'Explore photos and memorable moments from our school community, activities and events.', 'School Gallery', 'Explore our school gallery.'),
        ('events', 'Events', 'Discover upcoming school events, activities and important dates.', 'School Events', 'View upcoming school events.')
) AS defaults(
    page_slug,
    page_title,
    page_content,
    meta_title,
    meta_description
)
WHERE s.is_active = TRUE
  AND NOT EXISTS (
      SELECT 1
      FROM website_pages wp
      WHERE wp.school_id = s.id
        AND LOWER(wp.page_slug) = LOWER(defaults.page_slug)
  );

COMMIT;
