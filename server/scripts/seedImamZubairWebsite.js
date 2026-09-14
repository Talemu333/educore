require("dotenv").config();

const { Pool } = require("pg");
const { getDatabaseConfig } = require("../config/databaseConfig");
const centralPool = require("../config/database");

const SCHOOL_ID = 3;

const withRetry = async (operation, label) => {
    let lastError;
    for (let attempt = 1; attempt <= 5; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (!["EAI_AGAIN", "ECONNRESET", "ETIMEDOUT", "ECONNREFUSED"].includes(error?.code) || attempt === 5) {
                throw error;
            }
            console.warn(`${label} failed (${error.code}); retrying...`);
            await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
        }
    }
    throw lastError;
};

const getRegistry = async () => {
    const result = await withRetry(
        () => centralPool.query(
            `SELECT school_id, database_name FROM school_database_registry WHERE school_id = $1 LIMIT 1`,
            [SCHOOL_ID]
        ),
        "Loading school database registry"
    );
    if (!result.rows[0]) throw new Error(`School ${SCHOOL_ID} has no database registry entry.`);
    return result.rows[0];
};

const getSchoolSettings = async (client) => {
    const result = await client.query(`
        SELECT school_name, school_email, school_phone, school_address, school_motto, school_level
        FROM school_settings
        WHERE school_id = $1
        LIMIT 1
    `, [SCHOOL_ID]);
    return result.rows[0] || {};
};

const upsertPage = async (client, page) => {
    const existing = await client.query(
        `SELECT id FROM website_pages WHERE school_id = $1 AND page_slug = $2 LIMIT 1`,
        [SCHOOL_ID, page.page_slug]
    );

    if (existing.rows[0]) {
        await client.query(`
            UPDATE website_pages
            SET page_title = $1,
                page_content = $2,
                meta_title = $3,
                meta_description = $4,
                is_published = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6 AND school_id = $7
        `, [
            page.page_title,
            page.page_content,
            page.meta_title,
            page.meta_description,
            page.is_published,
            existing.rows[0].id,
            SCHOOL_ID,
        ]);
        return existing.rows[0].id;
    }

    const inserted = await client.query(`
        INSERT INTO website_pages (
            school_id, page_slug, page_title, page_content,
            meta_title, meta_description, is_published
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `, [
        SCHOOL_ID,
        page.page_slug,
        page.page_title,
        page.page_content,
        page.meta_title,
        page.meta_description,
        page.is_published,
    ]);
    return inserted.rows[0].id;
};

const replaceSection = async (client, pageId, section) => {
    await client.query(`
        DELETE FROM website_sections
        WHERE page_id = $1 AND school_id = $2 AND section_key = $3
    `, [pageId, SCHOOL_ID, section.section_key]);

    await client.query(`
        INSERT INTO website_sections (
            page_id, school_id, section_key, section_title, section_subtitle,
            section_content, image_url, button_text, button_url,
            display_order, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
    `, [
        pageId,
        SCHOOL_ID,
        section.section_key,
        section.section_title || null,
        section.section_subtitle || null,
        section.section_content || null,
        section.image_url || null,
        section.button_text || null,
        section.button_url || null,
        section.display_order || 0,
    ]);
};

const upsertNews = async (client, item) => {
    const existing = await client.query(
        `SELECT id FROM news WHERE school_id = $1 AND slug = $2 LIMIT 1`,
        [SCHOOL_ID, item.slug]
    );

    if (existing.rows[0]) {
        await client.query(`
            UPDATE news
            SET title = $1, excerpt = $2, content = $3, image_url = $4,
                author = $5, published_at = $6, is_published = $7, updated_at = CURRENT_TIMESTAMP
            WHERE id = $8 AND school_id = $9
        `, [
            item.title, item.excerpt, item.content, item.image_url || null,
            item.author, item.published_at || null, item.is_published,
            existing.rows[0].id, SCHOOL_ID,
        ]);
        return;
    }

    await client.query(`
        INSERT INTO news (
            school_id, title, slug, excerpt, content, image_url,
            author, published_at, is_published
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
        SCHOOL_ID, item.title, item.slug, item.excerpt, item.content,
        item.image_url || null, item.author, item.published_at || null, item.is_published,
    ]);
};

const upsertEvent = async (client, item) => {
    const existing = await client.query(
        `SELECT id FROM events WHERE school_id = $1 AND slug = $2 LIMIT 1`,
        [SCHOOL_ID, item.slug]
    );

    if (existing.rows[0]) {
        await client.query(`
            UPDATE events
            SET title = $1, description = $2, content = $3, image_url = $4,
                event_date = $5, start_time = $6, end_time = $7, venue = $8,
                organizer = $9, is_published = $10, updated_at = CURRENT_TIMESTAMP
            WHERE id = $11 AND school_id = $12
        `, [
            item.title, item.description, item.content, item.image_url || null,
            item.event_date, item.start_time || null, item.end_time || null,
            item.venue || null, item.organizer || null, item.is_published,
            existing.rows[0].id, SCHOOL_ID,
        ]);
        return;
    }

    await client.query(`
        INSERT INTO events (
            school_id, title, slug, description, content, image_url,
            event_date, start_time, end_time, venue, organizer, is_published
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
        SCHOOL_ID, item.title, item.slug, item.description, item.content,
        item.image_url || null, item.event_date, item.start_time || null,
        item.end_time || null, item.venue || null, item.organizer || null,
        item.is_published,
    ]);
};

const seed = async () => {
    const registry = await getRegistry();
    const schoolPool = new Pool(getDatabaseConfig(registry.database_name));

    try {
        const client = await withRetry(() => schoolPool.connect(), "Connecting to school database");
        try {
            await client.query("BEGIN");

            const settings = await getSchoolSettings(client);
            const schoolName = settings.school_name || "Imam Zubair Model School";

            const pages = [
                {
                    page_slug: "home",
                    page_title: `Welcome to ${schoolName}`,
                    page_content: "A supportive learning environment where learners are encouraged to grow in knowledge, character, confidence and responsibility.",
                    meta_title: `${schoolName} | Home`,
                    meta_description: `Official school website of ${schoolName}. Learn about our academics, admissions, activities and school community.`,
                    is_published: true,
                    sections: [
                        {
                            section_key: "hero",
                            section_title: `Welcome to ${schoolName}`,
                            section_subtitle: "Learning. Character. Excellence.",
                            section_content: "We are committed to providing a supportive educational environment that helps every learner develop academically, socially and morally.",
                            button_text: "Learn More About Us",
                            button_url: "/about",
                            display_order: 1,
                        },
                        {
                            section_key: "about_intro",
                            section_title: "A Place to Learn and Grow",
                            section_subtitle: "Education beyond the classroom",
                            section_content: "Our school seeks to combine quality teaching with discipline, good character and a positive school community. Parents and guardians can use this website to learn more about our programmes, admissions and school activities.",
                            button_text: "About Our School",
                            button_url: "/about",
                            display_order: 2,
                        },
                        {
                            section_key: "why_choose_us",
                            section_title: "Why Choose Our School?",
                            section_content: "A supportive learning environment; focus on academic development; emphasis on discipline and responsibility; and a school community that encourages learners to discover and develop their abilities.",
                            display_order: 3,
                        },
                        {
                            section_key: "admissions_cta",
                            section_title: "Admissions Information",
                            section_content: "Parents and guardians can contact the school to enquire about available classes, admission requirements, fees and admission dates.",
                            button_text: "View Admissions",
                            button_url: "/admissions",
                            display_order: 4,
                        },
                    ],
                },
                {
                    page_slug: "about",
                    page_title: `About ${schoolName}`,
                    page_content: `${schoolName} is committed to nurturing learners through quality teaching, good character and a supportive school environment.`,
                    meta_title: `About ${schoolName}`,
                    meta_description: `Learn about ${schoolName}, our educational approach, values, mission and vision.`,
                    is_published: true,
                    sections: [
                        {
                            section_key: "school_overview",
                            section_title: "Our School",
                            section_content: `${schoolName} is committed to creating an environment where learners can acquire knowledge, develop useful skills and build the character needed to contribute positively to society.`,
                            display_order: 1,
                        },
                        {
                            section_key: "mission",
                            section_title: "Our Mission",
                            section_content: "To provide quality education in a safe and supportive environment that encourages learning, discipline, confidence and good character.",
                            display_order: 2,
                        },
                        {
                            section_key: "vision",
                            section_title: "Our Vision",
                            section_content: "To raise well-rounded learners who are prepared to contribute positively to their families, communities and society.",
                            display_order: 3,
                        },
                        {
                            section_key: "core_values",
                            section_title: "Our Core Values",
                            section_content: "Integrity • Discipline • Excellence • Respect • Responsibility • Continuous Learning",
                            display_order: 4,
                        },
                    ],
                },
                {
                    page_slug: "academics",
                    page_title: "Academics",
                    page_content: "Our academic approach is designed to support effective teaching, active learning and the overall development of every learner.",
                    meta_title: `${schoolName} | Academics`,
                    meta_description: "Explore academic information and learning opportunities at the school.",
                    is_published: true,
                    sections: [
                        {
                            section_key: "academic_intro",
                            section_title: "Learning for Excellence",
                            section_content: "We encourage learners to develop strong foundations in their studies while building confidence, curiosity, communication skills and responsible habits.",
                            display_order: 1,
                        },
                        {
                            section_key: "learning_approach",
                            section_title: "Our Learning Approach",
                            section_content: "Teaching and learning should be purposeful, engaging and learner-focused, with appropriate attention to academic progress, practical understanding and good character.",
                            display_order: 2,
                        },
                        {
                            section_key: "academic_note",
                            section_title: "Academic Information",
                            section_content: "Specific class offerings, subjects, examination arrangements and academic calendars can be updated here by the school administrator as information changes.",
                            display_order: 3,
                        },
                    ],
                },
                {
                    page_slug: "admissions",
                    page_title: "Admissions",
                    page_content: "We welcome parents and guardians who wish to learn more about admission opportunities at our school.",
                    meta_title: `${schoolName} | Admissions`,
                    meta_description: "Find admission information and the steps for joining the school.",
                    is_published: true,
                    sections: [
                        {
                            section_key: "admission_intro",
                            section_title: "Admissions Information",
                            section_content: "Parents and guardians are encouraged to contact the school for current information on available classes, admission requirements, fees and admission dates.",
                            display_order: 1,
                        },
                        {
                            section_key: "admission_process",
                            section_title: "Admission Process",
                            section_content: "1. Make an enquiry.\n2. Obtain the application information.\n3. Submit the required documents.\n4. Complete any assessment or interview required by the school.\n5. Receive admission confirmation and complete enrolment.",
                            display_order: 2,
                        },
                        {
                            section_key: "admission_cta",
                            section_title: "Need More Information?",
                            section_content: "Use the contact details on this website or visit the school to speak with the appropriate admissions representative.",
                            button_text: "Contact Us",
                            button_url: "/contact",
                            display_order: 3,
                        },
                    ],
                },
                {
                    page_slug: "contact",
                    page_title: "Contact Us",
                    page_content: `Get in touch with ${schoolName} for admissions, academic enquiries and other school information.`,
                    meta_title: `${schoolName} | Contact`,
                    meta_description: `Contact ${schoolName} for enquiries and school information.`,
                    is_published: true,
                    sections: [
                        {
                            section_key: "contact_details",
                            section_title: "School Contact Information",
                            section_content: [
                                settings.school_address ? `Address: ${settings.school_address}` : null,
                                settings.school_phone ? `Phone: ${settings.school_phone}` : null,
                                settings.school_email ? `Email: ${settings.school_email}` : null,
                                settings.school_motto ? `Motto: ${settings.school_motto}` : null,
                            ].filter(Boolean).join("\n") || "Please update the school contact details from the school settings/dashboard.",
                            display_order: 1,
                        },
                        {
                            section_key: "contact_note",
                            section_title: "We Are Here to Help",
                            section_content: "For admissions, academic enquiries, school activities or general information, please contact the school through the official contact channels provided above.",
                            display_order: 2,
                        },
                    ],
                },
                {
                    page_slug: "news",
                    page_title: "School News",
                    page_content: "Stay updated with announcements, achievements and stories from our school community.",
                    meta_title: `${schoolName} | News`,
                    meta_description: "Latest school news and announcements.",
                    is_published: true,
                    sections: [],
                },
                {
                    page_slug: "events",
                    page_title: "School Events",
                    page_content: "View school activities and important events. Event dates should be updated by the school administrator before publication.",
                    meta_title: `${schoolName} | Events`,
                    meta_description: "School events and important dates.",
                    is_published: true,
                    sections: [],
                },
                {
                    page_slug: "gallery",
                    page_title: "School Gallery",
                    page_content: "Explore photos from our school community, activities and events. Upload actual school photographs from the dashboard before publishing gallery items.",
                    meta_title: `${schoolName} | Gallery`,
                    meta_description: "Photos and memories from the school community.",
                    is_published: true,
                    sections: [],
                },
            ];

            for (const page of pages) {
                const pageId = await upsertPage(client, page);
                for (const section of page.sections) {
                    await replaceSection(client, pageId, section);
                }
            }

            // These are deliberately unpublished sample records. They demonstrate
            // the News and Events dashboard fields without putting invented dates
            // or announcements on the public school website.
            await upsertNews(client, {
                title: "Welcome to Our School Website",
                slug: "welcome-to-our-school-website",
                excerpt: "A new online space for parents, learners and visitors to access school information.",
                content: `Welcome to the official website of ${schoolName}. This website provides a convenient place to learn about our school, academics, admissions and activities. The school administrator can replace this sample announcement with a real school news item from the dashboard.`,
                author: "School Administration",
                is_published: false,
            });

            await upsertNews(client, {
                title: "Admissions Information",
                slug: "admissions-information-sample",
                excerpt: "Sample news item showing how admission announcements can be published.",
                content: "This is a sample news item for demonstration. Replace it with the school's actual admission announcement, requirements and dates before publishing.",
                author: "School Administration",
                is_published: false,
            });

            await upsertEvent(client, {
                title: "Sample School Event",
                slug: "sample-school-event",
                description: "Sample event record for demonstrating the school dashboard.",
                content: "Replace this sample with a real school event. Update the event date, time, venue and organiser before publishing.",
                event_date: "2030-01-01",
                venue: "School Premises",
                organizer: "School Administration",
                is_published: false,
            });

            await client.query("COMMIT");

            console.log(`\nWebsite content seeded successfully for ${schoolName} (school ID ${SCHOOL_ID}).`);
            console.log(`Database: ${registry.database_name}`);
            console.log("Pages populated: Home, About, Academics, Admissions, Contact, News, Events and Gallery.");
            console.log("News/events sample records were kept UNPUBLISHED so no invented announcement/date appears publicly.");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    } finally {
        await schoolPool.end();
    }
};

seed()
    .then(async () => {
        await centralPool.end();
    })
    .catch(async (error) => {
        console.error("Imam Zubair website seeding failed:", error);
        try { await centralPool.end(); } catch {}
        process.exit(1);
    });
