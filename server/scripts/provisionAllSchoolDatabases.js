require("dotenv").config();

const { spawn } = require("node:child_process");
const path = require("node:path");
const database = require("../config/database");

const runProvision = (schoolId) => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [
        path.join(__dirname, "provisionSchoolDatabase.js"),
        String(schoolId),
    ], { stdio: "inherit", env: process.env });

    child.on("error", reject);
    child.on("close", (code) => {
        if (code === 0) return resolve();
        reject(new Error(`Provisioning school ${schoolId} failed with exit code ${code}.`));
    });
});

(async () => {
    try {
        // school_settings is the authoritative central list of registered schools.
        // Do not depend on registry.is_active here: the purpose of this utility is
        // to guarantee that every registered school has a dedicated database.
        const schoolsResult = await database.centralPool.query(`
            SELECT school_id, website_slug
            FROM school_settings
            ORDER BY school_id
        `);

        const schools = schoolsResult.rows
            .map((row) => ({
                schoolId: Number(row.school_id),
                websiteSlug: row.website_slug || `school-${row.school_id}`,
            }))
            .filter((row) => Number.isInteger(row.schoolId) && row.schoolId > 0);

        if (!schools.length) {
            console.log("No registered schools found in school_settings.");
            return;
        }

        // Repair/register the central database registry before provisioning.
        // Newly discovered schools are intentionally inactive until their
        // dedicated database has been provisioned successfully.
        for (const school of schools) {
            await database.centralPool.query(`
                INSERT INTO school_database_registry
                    (school_id, database_name, website_slug, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (school_id) DO UPDATE SET
                    database_name = EXCLUDED.database_name,
                    website_slug = EXCLUDED.website_slug,
                    updated_at = CURRENT_TIMESTAMP
            `, [school.schoolId, `educore_school_${school.schoolId}`, school.websiteSlug]);
        }

        console.log(`Found ${schools.length} registered school(s): ${schools.map((s) => s.schoolId).join(", ")}`);

        for (const school of schools) {
            console.log(`\n===== Provisioning school ${school.schoolId} =====`);
            await runProvision(school.schoolId);

            await database.centralPool.query(`
                UPDATE school_database_registry
                SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP
                WHERE school_id = $1
            `, [school.schoolId]);

            console.log(`School ${school.schoolId} dedicated database is active.`);
        }

        console.log("\nAll registered school databases have been provisioned successfully.");
    } catch (error) {
        console.error("Bulk school database provisioning failed:", error);
        process.exitCode = 1;
    } finally {
        await database.centralPool.end();
    }
})();
