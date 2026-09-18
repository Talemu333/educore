require("dotenv").config();

const { Pool } = require("pg");
const { getDatabaseConfig } = require("../config/databaseConfig");
const centralPool = require("../config/database");

const getRegistries = async () => {
    const result = await centralPool.query(`
        SELECT school_id, database_name
        FROM school_database_registry
        WHERE is_active = TRUE
        ORDER BY school_id
    `);
    return result.rows;
};

const replaceBrand = (value) => {
    if (value === null || value === undefined) return value;
    return String(value)
        .replace(/EduCore/g, "EduProw")
        .replace(/Educore/g, "Eduprow")
        .replace(/EDUCORE/g, "EDUPROW")
        .replace(/educore/g, "eduprow");
};

const updateSchoolWebsite = async (schoolId, databaseName) => {
    const pool = new Pool(getDatabaseConfig(databaseName));

    try {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const pageResult = await client.query(`
                UPDATE website_pages
                SET
                    page_title = regexp_replace(page_title, 'EduCore|Educore|EDUCORE|educore', 'EduProw', 'g'),
                    page_content = regexp_replace(page_content, 'EduCore|Educore|EDUCORE|educore', 'EduProw', 'g'),
                    meta_title = regexp_replace(meta_title, 'EduCore|Educore|EDUCORE|educore', 'EduProw', 'g'),
                    meta_description = regexp_replace(meta_description, 'EduCore|Educore|EDUCORE|educore', 'EduProw', 'g'),
                    updated_at = CURRENT_TIMESTAMP
                WHERE page_title ~* 'educore'
                   OR page_content ~* 'educore'
                   OR meta_title ~* 'educore'
                   OR meta_description ~* 'educore'
            `);

            const sectionResult = await client.query(`
                UPDATE website_sections
                SET
                    section_title = regexp_replace(section_title, 'EduCore|Educore|EDUCORE|educore', 'EduProw', 'g'),
                    section_subtitle = regexp_replace(section_subtitle, 'EduCore|Educore|EDUCORE|educore', 'EduProw', 'g'),
                    section_content = regexp_replace(section_content, 'EduCore|Educore|EDUCORE|educore', 'EduProw', 'g'),
                    image_url = regexp_replace(image_url, 'EduCore|Educore|EDUCORE|educore', 'EduProw', 'g'),
                    button_text = regexp_replace(button_text, 'EduCore|Educore|EDUCORE|educore', 'EduProw', 'g'),
                    button_url = regexp_replace(button_url, 'EduCore|Educore|EDUCORE|educore', 'EduProw', 'g')
                WHERE section_title ~* 'educore'
                   OR section_subtitle ~* 'educore'
                   OR section_content ~* 'educore'
                   OR image_url ~* 'educore'
                   OR button_text ~* 'educore'
                   OR button_url ~* 'educore'
            `);

            await client.query("COMMIT");

            console.log(
                `School ${schoolId}: updated ${pageResult.rowCount} website pages and ${sectionResult.rowCount} website sections.`
            );
        } catch (error) {
            try { await client.query("ROLLBACK"); } catch {}
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
    const registries = await getRegistries();

    if (argument && argument !== "--all") {
        const schoolId = Number(argument);
        if (!Number.isInteger(schoolId) || schoolId < 1) {
            throw new Error("Usage: node server/scripts/renameWebsiteBrand.js <schoolId> | --all");
        }

        const registry = registries.find((item) => Number(item.school_id) === schoolId);
        if (!registry?.database_name) {
            throw new Error(`School ${schoolId} has no active database registry entry.`);
        }

        await updateSchoolWebsite(schoolId, registry.database_name);
        return;
    }

    for (const registry of registries) {
        await updateSchoolWebsite(Number(registry.school_id), registry.database_name);
    }
};

main()
    .catch((error) => {
        console.error("Website brand update failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        try { await centralPool.end(); } catch {}
    });
