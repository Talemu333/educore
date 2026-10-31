require("dotenv").config();

const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");
const { getDatabaseConfig } = require("../config/databaseConfig");
const centralPool = require("../config/database");

const MIGRATION_FILE = path.resolve(
    __dirname,
    "../database/migrations/20261031_create_homepage_content_modules.sql"
);

const sampleTestimonials = [
    {
        author_name: "Sample Parent (Demo)",
        author_role: "Placeholder — replace with a genuine testimonial",
        testimonial_text: "SAMPLE CONTENT: Replace this placeholder with feedback provided and approved by a real parent or guardian before using it as a genuine testimonial.",
        rating: null,
        display_order: 1
    },
    {
        author_name: "Sample Student (Demo)",
        author_role: "Placeholder — replace with a genuine testimonial",
        testimonial_text: "SAMPLE CONTENT: This is demonstration text, not a real student review. Replace it with an authentic, approved account of a student's experience.",
        rating: null,
        display_order: 2
    }
];

const sampleFacilities = [
    {
        facility_name: "Sample Facility: Library",
        description: "Placeholder entry. Edit this item to describe the library or reading resources actually available at your school.",
        display_order: 1
    },
    {
        facility_name: "Sample Facility: Science Laboratory",
        description: "Placeholder entry. Replace this description with accurate information about your school's science learning facilities.",
        display_order: 2
    },
    {
        facility_name: "Sample Facility: ICT / Computer Room",
        description: "Placeholder entry. Edit this item to reflect the computers, devices and digital learning resources actually available.",
        display_order: 3
    },
    {
        facility_name: "Sample Facility: Sports and Recreation",
        description: "Placeholder entry. Replace this with details of the sports and recreation facilities provided by your school.",
        display_order: 4
    },
    {
        facility_name: "Sample Facility: Classrooms",
        description: "Placeholder entry. Describe your school's actual classroom environment and learning resources here.",
        display_order: 5
    },
    {
        facility_name: "Sample Facility: First Aid / Health Room",
        description: "Placeholder entry. Edit or remove this item depending on the health and first-aid provision at your school.",
        display_order: 6
    }
];

const sampleCoreValues = [
    {
        value_title: "Quality Education",
        description: "We are committed to meaningful learning, strong teaching and helping every learner make progress.",
        icon: "🎓",
        display_order: 1
    },
    {
        value_title: "Integrity",
        description: "We encourage honesty, responsibility and doing what is right in our words and actions.",
        icon: "🤝",
        display_order: 2
    },
    {
        value_title: "Respect",
        description: "We value every member of our school community and promote kindness, inclusion and mutual respect.",
        icon: "💛",
        display_order: 3
    },
    {
        value_title: "Excellence",
        description: "We encourage learners and staff to pursue their best and continually improve.",
        icon: "⭐",
        display_order: 4
    }
];

const applyMigration = async (client) => {
    const sql = await fs.readFile(MIGRATION_FILE, "utf8");
    await client.query(sql);
};

const seedIfEmpty = async (client, schoolId, table, rows, columns) => {
    const countResult = await client.query(
        `SELECT COUNT(*)::integer AS count FROM ${table} WHERE school_id = $1`,
        [schoolId]
    );

    if (countResult.rows[0].count > 0) {
        console.log(`School ${schoolId}: kept existing ${table} content.`);
        return 0;
    }

    for (const row of rows) {
        const values = [schoolId, ...columns.map((column) => row[column] ?? null)];
        const names = ["school_id", ...columns];
        const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
        await client.query(
            `INSERT INTO ${table} (${names.join(", ")}) VALUES (${placeholders})`,
            values
        );
    }

    console.log(`School ${schoolId}: added ${rows.length} sample rows to ${table}.`);
    return rows.length;
};

const seedSchoolDatabase = async ({ school_id: schoolId, database_name: databaseName }) => {
    if (!databaseName || !/^[A-Za-z0-9_]+$/.test(databaseName)) {
        throw new Error(`School ${schoolId} has an invalid database name.`);
    }

    const pool = new Pool(getDatabaseConfig(databaseName));
    let client;

    try {
        client = await pool.connect();
        await client.query("BEGIN");
        await applyMigration(client);

        const testimonialsAdded = await seedIfEmpty(
            client,
            schoolId,
            "testimonials",
            sampleTestimonials.map((item) => ({ ...item, is_published: true })),
            ["author_name", "author_role", "testimonial_text", "rating", "display_order", "is_published"]
        );

        const facilitiesAdded = await seedIfEmpty(
            client,
            schoolId,
            "school_facilities",
            sampleFacilities.map((item) => ({ ...item, image_url: null, is_published: true })),
            ["facility_name", "description", "image_url", "display_order", "is_published"]
        );

        let coreValues = sampleCoreValues.map((item) => ({ ...item, is_published: true }));
        const legacyValues = await client.query(`
            SELECT DISTINCT ON (ws.section_key)
                ws.section_title AS value_title,
                ws.section_content AS description,
                '✦' AS icon,
                ROW_NUMBER() OVER (ORDER BY ws.display_order, ws.id)::integer AS display_order
            FROM website_sections ws
            JOIN website_pages wp ON wp.id = ws.page_id
            WHERE ws.school_id = $1
              AND wp.school_id = $1
              AND (
                  ws.section_key LIKE 'core_value_%'
                  OR ws.section_key IN (
                      'quality_education',
                      'caring_environment',
                      'critical_thinking',
                      'character_development'
                  )
              )
              AND COALESCE(ws.section_title, '') <> ''
            ORDER BY ws.section_key, ws.display_order, ws.id
        `, [schoolId]);

        if (legacyValues.rows.length) {
            coreValues = legacyValues.rows.map((item, index) => ({
                ...item,
                display_order: index + 1,
                is_published: true
            }));
        }

        const coreValuesAdded = await seedIfEmpty(
            client,
            schoolId,
            "school_core_values",
            coreValues,
            ["value_title", "description", "icon", "display_order", "is_published"]
        );

        await client.query("COMMIT");
        console.log(
            `School ${schoolId} (${databaseName}) complete: ` +
            `${testimonialsAdded} testimonials, ${facilitiesAdded} facilities, ${coreValuesAdded} core values added.`
        );
        return { schoolId, databaseName, testimonialsAdded, facilitiesAdded, coreValuesAdded };
    } catch (error) {
        if (client) {
            try { await client.query("ROLLBACK"); } catch {}
        }
        throw error;
    } finally {
        if (client) client.release();
        await pool.end();
    }
};

const main = async () => {
    const result = await centralPool.query(`
        SELECT school_id, database_name
        FROM school_database_registry
        WHERE is_active = TRUE
        ORDER BY school_id
    `);

    if (!result.rows.length) {
        console.log("No active school databases were found.");
        return;
    }

    const summary = [];
    const failures = [];

    for (const school of result.rows) {
        try {
            summary.push(await seedSchoolDatabase(school));
        } catch (error) {
            failures.push({ schoolId: school.school_id, databaseName: school.database_name, error: error.message });
            console.error(`School ${school.school_id} failed: ${error.message}`);
        }
    }

    console.log("\nHomepage content seeding summary:");
    console.table(summary);
    if (failures.length) {
        console.error("\nSome school databases could not be seeded:");
        console.table(failures);
        process.exitCode = 1;
    }
};

main()
    .catch((error) => {
        console.error("Homepage content seeding failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await centralPool.end();
    });
