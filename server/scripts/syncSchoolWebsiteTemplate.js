require("dotenv").config();

const { Pool } = require("pg");
const { getDatabaseConfig } = require("../config/databaseConfig");
const centralPool = require("../config/database");

const RETRYABLE_DB_ERRORS = new Set(["EAI_AGAIN", "ECONNRESET", "ETIMEDOUT", "ECONNREFUSED"]);
const DB_RETRY_ATTEMPTS = 5;
const DB_RETRY_DELAY_MS = 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withDatabaseRetry = async (operation, label = "database operation") => {
    let lastError;
    for (let attempt = 1; attempt <= DB_RETRY_ATTEMPTS; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (!RETRYABLE_DB_ERRORS.has(error?.code) || attempt === DB_RETRY_ATTEMPTS) {
                throw error;
            }
            console.warn(
                `${label} failed with ${error.code}. Retrying (${attempt}/${DB_RETRY_ATTEMPTS - 1})...`
            );
            await sleep(DB_RETRY_DELAY_MS * attempt);
        }
    }
    throw lastError;
};

const getRegistryEntry = async (schoolId) => {
    const result = await withDatabaseRetry(
        () => centralPool.query(
            `
                SELECT school_id, database_name
                FROM school_database_registry
                WHERE school_id = $1
                LIMIT 1
            `,
            [schoolId]
        ),
        "Loading school database registry"
    );
    return result.rows[0] || null;
};

const loadTemplate = async () => {
    const registry = await getRegistryEntry(1);
    if (!registry?.database_name) {
        throw new Error("School 1 has no registered database.");
    }

    const pool = new Pool(getDatabaseConfig(registry.database_name));

    try {
        const client = await withDatabaseRetry(
            () => pool.connect(),
            "Connecting to School 1 database"
        );

        try {
            const pages = await withDatabaseRetry(
                () => client.query(
                    `
                        SELECT
                            page_slug,
                            page_title,
                            page_content,
                            meta_title,
                            meta_description,
                            is_published
                        FROM website_pages
                        WHERE school_id = 1
                        ORDER BY id
                    `
                ),
                "Loading School 1 website pages"
            );

            const sections = await withDatabaseRetry(
                () => client.query(
                    `
                        SELECT
                            wp.page_slug,
                            ws.section_key,
                            ws.section_title,
                            ws.section_subtitle,
                            ws.section_content,
                            ws.image_url,
                            ws.button_text,
                            ws.button_url,
                            ws.display_order,
                            ws.is_active
                        FROM website_sections ws
                        JOIN website_pages wp ON wp.id = ws.page_id
                        WHERE ws.school_id = 1
                          AND wp.school_id = 1
                        ORDER BY wp.id, ws.display_order, ws.id
                    `
                ),
                "Loading School 1 website sections"
            );

            if (!pages.rows.length) {
                throw new Error("School 1 has no website pages to copy.");
            }

            return {
                pages: pages.rows,
                sections: sections.rows,
            };
        } finally {
            client.release();
        }
    } finally {
        await pool.end();
    }
};

const syncSchool = async (schoolId, template) => {
    if (schoolId === 1) {
        console.log("Skipping School 1 because it is the website template source.");
        return;
    }

    const registry = await getRegistryEntry(schoolId);
    if (!registry?.database_name) {
        throw new Error(`School ${schoolId} has no registered database.`);
    }

    const pool = new Pool(getDatabaseConfig(registry.database_name));

    try {
        const client = await withDatabaseRetry(
            () => pool.connect(),
            `Connecting to school ${schoolId} database`
        );

        try {
            await client.query("BEGIN");

            await client.query(
                "DELETE FROM website_sections WHERE school_id = $1",
                [schoolId]
            );
            await client.query(
                "DELETE FROM website_pages WHERE school_id = $1",
                [schoolId]
            );

            const pageIds = new Map();

            for (const page of template.pages) {
                const result = await client.query(
                    `
                        INSERT INTO website_pages (
                            school_id,
                            page_slug,
                            page_title,
                            page_content,
                            meta_title,
                            meta_description,
                            is_published
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING id
                    `,
                    [
                        schoolId,
                        page.page_slug,
                        page.page_title,
                        page.page_content,
                        page.meta_title,
                        page.meta_description,
                        page.is_published,
                    ]
                );

                pageIds.set(page.page_slug, result.rows[0].id);
            }

            for (const section of template.sections) {
                const pageId = pageIds.get(section.page_slug);
                if (!pageId) {
                    throw new Error(
                        `Template section ${section.section_key || "unnamed"} references missing page ${section.page_slug}.`
                    );
                }

                await client.query(
                    `
                        INSERT INTO website_sections (
                            page_id,
                            school_id,
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
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    `,
                    [
                        pageId,
                        schoolId,
                        section.section_key,
                        section.section_title,
                        section.section_subtitle,
                        section.section_content,
                        section.image_url,
                        section.button_text,
                        section.button_url,
                        section.display_order,
                        section.is_active,
                    ]
                );
            }

            await client.query("COMMIT");

            console.log(
                `School ${schoolId} website synced from School 1: ${template.pages.length} pages, ${template.sections.length} sections.`
            );
        } catch (error) {
            try {
                await client.query("ROLLBACK");
            } catch {}
            throw error;
        } finally {
            client.release();
        }
    } finally {
        await pool.end();
    }
};

const main = async () => {
    const argument = process.argv[2];
    const template = await loadTemplate();

    if (argument === "--all") {
        const result = await centralPool.query(
            `
                SELECT school_id
                FROM school_database_registry
                WHERE is_active = TRUE
                  AND school_id <> 1
                ORDER BY school_id
            `
        );

        for (const row of result.rows) {
            await syncSchool(Number(row.school_id), template);
        }
        return;
    }

    const schoolId = Number(argument);
    if (!Number.isInteger(schoolId) || schoolId < 2) {
        throw new Error(
            "Usage: node server/scripts/syncSchoolWebsiteTemplate.js <schoolId> | --all"
        );
    }

    await syncSchool(schoolId, template);
};

main()
    .catch((error) => {
        console.error("School website template sync failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        try {
            await centralPool.end();
        } catch {}
    });
