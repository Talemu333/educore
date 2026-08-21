const pool = require("../config/database");

/*
=========================================
GET ALL PUBLISHED PAGES
=========================================
*/

const getPublishedPages = async () => {

    const query = `
        SELECT
            id,
            page_slug,
            page_title,
            page_content,
            meta_title,
            meta_description,
            is_published
        FROM website_pages
        WHERE is_published = TRUE
        ORDER BY id;
    `;

    const result = await pool.query(query);

    return result.rows;
};


/*
=========================================
GET PAGE BY SLUG
=========================================
*/

const getPageBySlug = async (slug) => {

    const query = `
        SELECT
            id,
            page_slug,
            page_title,
            page_content,
            meta_title,
            meta_description,
            is_published
        FROM website_pages
        WHERE
            page_slug = $1
            AND is_published = TRUE
        LIMIT 1;
    `;

    const result = await pool.query(
        query,
        [slug]
    );

    return result.rows[0];
};


/*
=========================================
GET PAGE SECTIONS
=========================================
*/

const getPageSections = async (pageId) => {

    const query = `
        SELECT
            id,
            page_id,
            section_key,
            section_title,
            section_subtitle,
            section_content,
            image_url,
            button_text,
            button_url,
            display_order,
            is_active
        FROM website_sections
        WHERE
            page_id = $1
            AND is_active = TRUE
        ORDER BY display_order, id;
    `;

    const result = await pool.query(
        query,
        [pageId]
    );

    return result.rows;
};


/*
=========================================
GET COMPLETE PAGE
=========================================
*/

const getCompletePage = async (slug) => {

    const page = await getPageBySlug(slug);

    if (!page) {
        return null;
    }

    const sections =
        await getPageSections(page.id);

    return {
        ...page,
        sections
    };
};


/*
=========================================
GET ALL PAGES FOR ADMIN
=========================================
*/

const getAllPages = async () => {

    const query = `
        SELECT
            id,
            page_slug,
            page_title,
            page_content,
            meta_title,
            meta_description,
            is_published,
            created_at,
            updated_at
        FROM website_pages
        ORDER BY id;
    `;

    const result = await pool.query(query);

    return result.rows;
};


/*
=========================================
UPDATE PAGE
=========================================
*/

const updatePage = async (
    pageId,
    data
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        /*
        =====================================
        UPDATE PAGE
        =====================================
        */

        const pageQuery = `
            UPDATE website_pages
            SET
                page_title = $2,
                page_content = $3,
                meta_title = $4,
                meta_description = $5,
                is_published = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *;
        `;


        const pageResult =
            await client.query(
                pageQuery,
                [
                    pageId,
                    data.page_title || "",
                    data.page_content || "",
                    data.meta_title || "",
                    data.meta_description || "",
                    data.is_published !== false
                ]
            );


        if (!pageResult.rows.length) {

            await client.query("ROLLBACK");

            return null;

        }


        /*
        =====================================
        EXISTING SECTION IDS
        =====================================
        */

        const submittedSections =
            Array.isArray(data.sections)
                ? data.sections
                : [];


        const existingIds =
            submittedSections

                .filter(section => section.id)

                .map(section =>
                    Number(section.id)
                );


        /*
        =====================================
        DELETE REMOVED SECTIONS
        =====================================
        */

        if (existingIds.length > 0) {

            await client.query(
                `
                    DELETE FROM website_sections
                    WHERE page_id = $1
                    AND id <> ALL($2::integer[]);
                `,
                [
                    pageId,
                    existingIds
                ]
            );

        } else {

            await client.query(
                `
                    DELETE FROM website_sections
                    WHERE page_id = $1;
                `,
                [pageId]
            );

        }


        /*
        =====================================
        SAVE SECTIONS
        =====================================
        */

        for (
            let index = 0;
            index < submittedSections.length;
            index++
        ) {

            const section =
                submittedSections[index];


            const displayOrder =
                section.display_order ??
                index;


            /*
            ================================
            UPDATE EXISTING SECTION
            ================================
            */

            if (section.id) {

                await client.query(
                    `
                        UPDATE website_sections
                        SET
                            section_key = $2,
                            section_title = $3,
                            section_subtitle = $4,
                            section_content = $5,
                            image_url = $6,
                            button_text = $7,
                            button_url = $8,
                            display_order = $9,
                            is_active = $10,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = $1
                        AND page_id = $11;
                    `,
                    [
                        Number(section.id),

                        section.section_key ||
                            null,

                        section.section_title ||
                            "",

                        section.section_subtitle ||
                            null,

                        section.section_content ||
                            null,

                        section.image_url ||
                            null,

                        section.button_text ||
                            null,

                        section.button_url ||
                            null,

                        displayOrder,

                        section.is_active !== false,

                        pageId
                    ]
                );

            }


            /*
            ================================
            CREATE NEW SECTION
            ================================
            */

            else {

                await client.query(
                    `
                        INSERT INTO website_sections (
                            page_id,
                            section_key,
                            section_title,
                            section_subtitle,
                            section_content,
                            image_url,
                            button_text,
                            button_url,
                            display_order,
                            is_active
                        )
                        VALUES (
                            $1,
                            $2,
                            $3,
                            $4,
                            $5,
                            $6,
                            $7,
                            $8,
                            $9,
                            $10
                        );
                    `,
                    [
                        pageId,

                        section.section_key ||
                            null,

                        section.section_title ||
                            "",

                        section.section_subtitle ||
                            null,

                        section.section_content ||
                            null,

                        section.image_url ||
                            null,

                        section.button_text ||
                            null,

                        section.button_url ||
                            null,

                        displayOrder,

                        section.is_active !== false
                    ]
                );

            }

        }


        await client.query("COMMIT");


        /*
        =====================================
        RETURN COMPLETE PAGE
        =====================================
        */

        const updatedPageResult =
            await client.query(
                `
                    SELECT *
                    FROM website_pages
                    WHERE id = $1;
                `,
                [pageId]
            );


        const sectionsResult =
            await client.query(
                `
                    SELECT
                        id,
                        page_id,
                        section_key,
                        section_title,
                        section_subtitle,
                        section_content,
                        image_url,
                        button_text,
                        button_url,
                        display_order,
                        is_active
                    FROM website_sections
                    WHERE page_id = $1
                    ORDER BY display_order ASC, id ASC;
                `,
                [pageId]
            );


        return {

            ...updatedPageResult.rows[0],

            sections:
                sectionsResult.rows

        };

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }

};

/*
=====================================
GET SECTIONS FOR A PAGE
=====================================
*/

const getSectionsByPageId = async (pageId) => {

    const query = `
        SELECT *
        FROM website_sections
        WHERE page_id = $1
        ORDER BY display_order ASC, id ASC;
    `;

    const result = await pool.query(
        query,
        [pageId]
    );

    return result.rows;
};


/*
=====================================
CREATE WEBSITE SECTION
=====================================
*/

const createSection = async (data) => {

    const query = `
        INSERT INTO website_sections (
            page_id,
            section_key,
            section_title,
            section_subtitle,
            section_content,
            image_url,
            button_text,
            button_url,
            display_order,
            is_active
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10
        )
        RETURNING *;
    `;

    const values = [
        data.page_id,
        data.section_key,
        data.section_title || null,
        data.section_subtitle || null,
        data.section_content || null,
        data.image_url || null,
        data.button_text || null,
        data.button_url || null,
        data.display_order || 0,
        data.is_active !== false
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0];
};


/*
=====================================
UPDATE WEBSITE SECTION
=====================================
*/

const updateSection = async (
    sectionId,
    data
) => {

    const query = `
        UPDATE website_sections
        SET
            section_key = $2,
            section_title = $3,
            section_subtitle = $4,
            section_content = $5,
            image_url = $6,
            button_text = $7,
            button_url = $8,
            display_order = $9,
            is_active = $10,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
    `;

    const values = [
        sectionId,
        data.section_key,
        data.section_title || null,
        data.section_subtitle || null,
        data.section_content || null,
        data.image_url || null,
        data.button_text || null,
        data.button_url || null,
        data.display_order || 0,
        data.is_active !== false
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0];
};


/*
=====================================
DELETE WEBSITE SECTION
=====================================
*/

const deleteSection = async (
    sectionId
) => {

    const query = `
        DELETE FROM website_sections
        WHERE id = $1
        RETURNING *;
    `;

    const result = await pool.query(
        query,
        [sectionId]
    );

    return result.rows[0];
};

/*
=========================================
PUBLIC: GET ALL PUBLISHED NEWS
=========================================
*/

const getPublishedNews = async () => {

    const query = `
        SELECT
            id,
            title,
            slug,
            excerpt,
            content,
            image_url,
            author,
            published_at,
            is_published,
            created_at,
            updated_at
        FROM news
        WHERE is_published = TRUE
        ORDER BY
            published_at DESC NULLS LAST,
            created_at DESC,
            id DESC;
    `;

    const result = await pool.query(query);

    return result.rows;
};


/*
=========================================
PUBLIC: GET PUBLISHED NEWS BY SLUG
=========================================
*/

const getNewsBySlug = async (slug) => {

    const query = `
        SELECT
            id,
            title,
            slug,
            excerpt,
            content,
            image_url,
            author,
            published_at,
            is_published,
            created_at,
            updated_at
        FROM news
        WHERE
            slug = $1
            AND is_published = TRUE
        LIMIT 1;
    `;

    const result = await pool.query(
        query,
        [slug]
    );

    return result.rows[0];
};


/*
=========================================
ADMIN: GET ALL NEWS
=========================================
*/

const getAllNews = async () => {

    const query = `
        SELECT
            id,
            title,
            slug,
            excerpt,
            content,
            image_url,
            author,
            published_at,
            is_published,
            created_at,
            updated_at
        FROM news
        ORDER BY
            created_at DESC,
            id DESC;
    `;

    const result = await pool.query(query);

    return result.rows;
};


/*
=========================================
ADMIN: CREATE NEWS
=========================================
*/

const createNews = async (data) => {

    const query = `
        INSERT INTO news (
            title,
            slug,
            excerpt,
            content,
            image_url,
            author,
            published_at,
            is_published
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8
        )
        RETURNING *;
    `;

    const values = [

        data.title,

        data.slug,

        data.excerpt ||
            null,

        data.content,

        data.image_url ||
            null,

        data.author ||
            null,

        data.published_at ||
            null,

        data.is_published === true

    ];

    const result =
        await pool.query(
            query,
            values
        );

    return result.rows[0];
};


/*
=========================================
ADMIN: UPDATE NEWS
=========================================
*/

const updateNews = async (
    newsId,
    data
) => {

    const query = `
        UPDATE news
        SET
            title = $2,
            slug = $3,
            excerpt = $4,
            content = $5,
            image_url = $6,
            author = $7,
            published_at = $8,
            is_published = $9,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
    `;

    const values = [

        newsId,

        data.title,

        data.slug,

        data.excerpt ||
            null,

        data.content,

        data.image_url ||
            null,

        data.author ||
            null,

        data.published_at ||
            null,

        data.is_published === true

    ];

    const result =
        await pool.query(
            query,
            values
        );

    return result.rows[0];
};


/*
=========================================
ADMIN: DELETE NEWS
=========================================
*/

const deleteNews = async (
    newsId
) => {

    const query = `
        DELETE FROM news
        WHERE id = $1
        RETURNING *;
    `;

    const result =
        await pool.query(
            query,
            [newsId]
        );

    return result.rows[0];
};

/*
=========================================
EVENTS
=========================================
*/


/*
=========================================
PUBLIC: GET PUBLISHED EVENTS
=========================================
*/

const getPublishedEvents = async () => {

    const result =
        await pool.query(`

            SELECT
                id,
                title,
                slug,
                description,
                content,
                image_url,
                event_date,
                start_time,
                end_time,
                venue,
                organizer,
                is_published,
                created_at,
                updated_at

            FROM events

            WHERE is_published = true

            ORDER BY event_date ASC,
                     start_time ASC

        `);

    return result.rows;

};


/*
=========================================
PUBLIC: GET EVENT BY SLUG
=========================================
*/

const getEventBySlug = async (
    slug
) => {

    const result =
        await pool.query(`

            SELECT
                id,
                title,
                slug,
                description,
                content,
                image_url,
                event_date,
                start_time,
                end_time,
                venue,
                organizer,
                is_published,
                created_at,
                updated_at

            FROM events

            WHERE slug = $1
            AND is_published = true

            LIMIT 1

        `, [
            slug
        ]);

    return result.rows[0];

};


/*
=========================================
ADMIN: GET ALL EVENTS
=========================================
*/

const getAllEvents = async () => {

    const result =
        await pool.query(`

            SELECT
                id,
                title,
                slug,
                description,
                content,
                image_url,
                event_date,
                start_time,
                end_time,
                venue,
                organizer,
                is_published,
                created_at,
                updated_at

            FROM events

            ORDER BY event_date ASC,
                     start_time ASC

        `);

    return result.rows;

};


/*
=========================================
ADMIN: GET EVENT BY ID
=========================================
*/

const getEventById = async (
    id
) => {

    const result =
        await pool.query(`

            SELECT
                id,
                title,
                slug,
                description,
                content,
                image_url,
                event_date,
                start_time,
                end_time,
                venue,
                organizer,
                is_published,
                created_at,
                updated_at

            FROM events

            WHERE id = $1

            LIMIT 1

        `, [
            id
        ]);

    return result.rows[0];

};


/*
=========================================
ADMIN: CREATE EVENT
=========================================
*/

const createEvent = async (
    data
) => {

    const result =
        await pool.query(`

            INSERT INTO events (

                title,
                slug,
                description,
                content,
                image_url,
                event_date,
                start_time,
                end_time,
                venue,
                organizer,
                is_published

            )

            VALUES (

                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11

            )

            RETURNING *

        `, [

            data.title,
            data.slug,
            data.description || null,
            data.content || null,
            data.image_url || null,
            data.event_date,
            data.start_time || null,
            data.end_time || null,
            data.venue || null,
            data.organizer || null,
            data.is_published ?? false

        ]);

    return result.rows[0];

};


/*
=========================================
ADMIN: UPDATE EVENT
=========================================
*/

const updateEvent = async (
    id,
    data
) => {

    const result =
        await pool.query(`

            UPDATE events

            SET

                title = $1,
                slug = $2,
                description = $3,
                content = $4,
                image_url = $5,
                event_date = $6,
                start_time = $7,
                end_time = $8,
                venue = $9,
                organizer = $10,
                is_published = $11,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $12

            RETURNING *

        `, [

            data.title,
            data.slug,
            data.description || null,
            data.content || null,
            data.image_url || null,
            data.event_date,
            data.start_time || null,
            data.end_time || null,
            data.venue || null,
            data.organizer || null,
            data.is_published ?? false,
            id

        ]);

    return result.rows[0];

};


/*
=========================================
ADMIN: DELETE EVENT
=========================================
*/

const deleteEvent = async (
    id
) => {

    const result =
        await pool.query(`

            DELETE FROM events

            WHERE id = $1

            RETURNING *

        `, [
            id
        ]);

    return result.rows[0];

};

/*
=====================================
GALLERY: GET ALL PUBLISHED ITEMS
=====================================
*/

const getPublishedGallery = async () => {

    const query = `
        SELECT
            id,
            title,
            description,
            image_url,
            category,
            display_order,
            is_published,
            created_at,
            updated_at
        FROM gallery
        WHERE is_published = TRUE
        ORDER BY display_order ASC, id ASC;
    `;

    const result = await pool.query(query);

    return result.rows;

};


/*
=====================================
GALLERY: GET ALL ITEMS FOR ADMIN
=====================================
*/

const getAllGallery = async () => {

    const query = `
        SELECT
            id,
            title,
            description,
            image_url,
            category,
            display_order,
            is_published,
            created_at,
            updated_at
        FROM gallery
        ORDER BY display_order ASC, id ASC;
    `;

    const result = await pool.query(query);

    return result.rows;

};


/*
=====================================
GALLERY: GET ONE ITEM
=====================================
*/

const getGalleryById = async (
    id
) => {

    const query = `
        SELECT
            id,
            title,
            description,
            image_url,
            category,
            display_order,
            is_published,
            created_at,
            updated_at
        FROM gallery
        WHERE id = $1
        LIMIT 1;
    `;

    const result = await pool.query(
        query,
        [id]
    );

    return result.rows[0];

};


/*
=====================================
GALLERY: CREATE ITEM
=====================================
*/

const createGallery = async (
    data
) => {

    const query = `
        INSERT INTO gallery (
            title,
            description,
            image_url,
            category,
            display_order,
            is_published
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
        )
        RETURNING *;
    `;

    const values = [

        data.title,

        data.description ||
            null,

        data.image_url,

        data.category ||
            null,

        data.display_order ??
            0,

        data.is_published !== false

    ];

    const result =
        await pool.query(
            query,
            values
        );

    return result.rows[0];

};


/*
=====================================
GALLERY: UPDATE ITEM
=====================================
*/

const updateGallery = async (
    id,
    data
) => {

    const query = `
        UPDATE gallery
        SET
            title = $2,
            description = $3,
            image_url = $4,
            category = $5,
            display_order = $6,
            is_published = $7,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
    `;

    const values = [

        id,

        data.title,

        data.description ||
            null,

        data.image_url,

        data.category ||
            null,

        data.display_order ??
            0,

        data.is_published !== false

    ];

    const result =
        await pool.query(
            query,
            values
        );

    return result.rows[0];

};


/*
=====================================
GALLERY: DELETE ITEM
=====================================
*/

const deleteGallery = async (
    id
) => {

    const query = `
        DELETE FROM gallery
        WHERE id = $1
        RETURNING *;
    `;

    const result =
        await pool.query(
            query,
            [id]
        );

    return result.rows[0];

};


module.exports = {

    getPublishedPages,

    getPageBySlug,

    getPageSections,

    getCompletePage,

    getAllPages,

    updatePage,
    deleteSection,
    updateSection,
    createSection,
    getSectionsByPageId,

    getPublishedNews,
    getNewsBySlug,
    getAllNews,
    createNews,
    updateNews,
    deleteNews,

    getPublishedGallery,
    getAllGallery,
    getGalleryById,
    createGallery,
    updateGallery,
    deleteGallery,

    getPublishedEvents,
    getEventBySlug,
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,


};