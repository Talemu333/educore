require("dotenv").config();

const { spawn } = require("node:child_process");
const database = require("../config/database");

const runProvision = (schoolId) => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [
        require("node:path").join(__dirname, "provisionSchoolDatabase.js"),
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
        const result = await database.centralPool.query(`
            SELECT school_id
            FROM school_database_registry
            WHERE is_active = TRUE
            ORDER BY school_id
        `);

        const schoolIds = result.rows.map((row) => Number(row.school_id)).filter(Number.isInteger);
        if (!schoolIds.length) {
            console.log("No active school database registry entries found.");
            return;
        }

        console.log(`Found ${schoolIds.length} active school database(s): ${schoolIds.join(", ")}`);

        for (const schoolId of schoolIds) {
            console.log(`\n===== Provisioning school ${schoolId} =====`);
            await runProvision(schoolId);
        }

        console.log("\nAll active school databases have been provisioned successfully.");
    } catch (error) {
        console.error("Bulk school database provisioning failed:", error);
        process.exitCode = 1;
    } finally {
        await database.centralPool.end();
    }
})();
