const pool = require("../config/database");

const ensureDefaultWebsitePages = async (schoolId) => {
    await pool.query(`
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
            $1,
            defaults.page_slug,
            defaults.page_title,
            defaults.page_content,
            defaults.meta_title,
            defaults.meta_description,
            TRUE
        FROM (
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
        WHERE NOT EXISTS (
            SELECT 1
            FROM website_pages existing
            WHERE existing.school_id = $1
              AND LOWER(existing.page_slug) = LOWER(defaults.page_slug)
        );
    `, [schoolId]);
};

const getSchoolBySlug = async (slug) => {
    const result = await pool.query(`
        SELECT
            ss.*,
            COALESCE(
                NULLIF(TRIM(ss.website_slug), ''),
                NULLIF(
                    regexp_replace(
                        regexp_replace(
                            lower(trim(ss.school_name)),
                            '[^a-z0-9]+',
                            '-',
                            'g'
                        ),
                        '(^-|-$)',
                        '',
                        'g'
                    ),
                    ''
                ),
                'school-' || ss.school_id::text
            ) AS resolved_website_slug
        FROM school_settings ss
        WHERE ss.is_active = TRUE
          AND (
              LOWER(TRIM(COALESCE(ss.website_slug, ''))) = LOWER(TRIM($1))
              OR LOWER(
                  regexp_replace(
                      regexp_replace(
                          lower(trim(ss.school_name)),
                          '[^a-z0-9]+',
                          '-',
                          'g'
                      ),
                      '(^-|-$)',
                      '',
                      'g'
                  )
              ) = LOWER(TRIM($1))
              OR LOWER('school-' || ss.school_id::text) = LOWER(TRIM($1))
              OR LOWER('school' || ss.school_id::text) = LOWER(TRIM($1))
          )
        LIMIT 1;
    `, [slug]);

    const school = result.rows[0];

    if (!school) return null;

    await ensureDefaultWebsitePages(school.school_id);

    school.website_slug = school.resolved_website_slug;
    delete school.resolved_website_slug;

    return school;
};

module.exports = { getSchoolBySlug };
