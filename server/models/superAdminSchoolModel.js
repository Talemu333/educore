const pool = require("../config/database");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { migrateSchoolData } = require("../scripts/migrateSchoolData");

const execFileAsync = promisify(execFile);
const provisionerPath = path.resolve(__dirname, "../scripts/provisionSchoolDatabase.js");

const provisionSchoolDatabase = async (schoolId) => {
    try {
        await execFileAsync(process.execPath, [provisionerPath, String(schoolId)], {
            cwd: path.resolve(__dirname, ".."),
            env: process.env,
            maxBuffer: 10 * 1024 * 1024,
        });
    } catch (error) {
        const output = [error?.stdout, error?.stderr, error?.message].filter(Boolean).join("\n").trim();
        const provisioningError = new Error(`School database provisioning failed for school ${schoolId}.${output ? ` ${output}` : ""}`);
        provisioningError.status = 503;
        provisioningError.cause = error;
        throw provisioningError;
    }
};

const getSchools = async () => {
    const result = await pool.query(`
        SELECT ss.school_id, ss.school_name, ss.website_slug, ss.admission_prefix,
               ss.school_email, ss.school_phone, ss.school_address,
               ss.school_logo, ss.school_level, ss.school_motto,
               ss.is_active, ss.created_at, ss.updated_at,
               COUNT(u.id)::INTEGER AS user_count
        FROM school_settings ss
        LEFT JOIN users u ON u.school_id = ss.school_id
        GROUP BY ss.school_id, ss.school_name, ss.website_slug, ss.admission_prefix,
                 ss.school_email, ss.school_phone, ss.school_address,
                 ss.school_logo, ss.school_level, ss.school_motto,
                 ss.is_active, ss.created_at, ss.updated_at
        ORDER BY ss.school_id;
    `);

    // The super-admin school list doubles as a safe recovery point. This lets
    // deployments without a paid server shell recover a database created by an
    // interrupted provisioning attempt, and migrates legacy central data once
    // when the dedicated database only contains its initial administrator.
    for (const school of result.rows) {
        try {
            const registryResult = await pool.query(`
                SELECT database_name, is_active
                FROM school_database_registry
                WHERE school_id = $1
                LIMIT 1
            `, [school.school_id]);
            const registry = registryResult.rows[0];
            if (!registry) continue;

            if (!registry.is_active) {
                await provisionSchoolDatabase(school.school_id);
                await pool.query(`
                    UPDATE school_database_registry
                    SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP
                    WHERE school_id = $1
                `, [school.school_id]);
            }

            if (school.user_count > 1) {
                await migrateSchoolData(school.school_id);
            }
        } catch (error) {
            console.warn(`School database recovery skipped for school ${school.school_id}: ${error.message}`);
        }
    }

    return result.rows;
};

const getSchoolById = async (schoolId) => {
    const result = await pool.query(`
        SELECT ss.*, COUNT(u.id)::INTEGER AS user_count
        FROM school_settings ss
        LEFT JOIN users u ON u.school_id = ss.school_id
        WHERE ss.school_id = $1
        GROUP BY ss.id
        LIMIT 1;
    `, [schoolId]);
    return result.rows[0];
};

const createSchool = async (school, admin, hashedPassword) => {
    const client = await pool.connect();
    let schoolId;
    try {
        await client.query("BEGIN");
        const schoolResult = await client.query(`
            INSERT INTO schools (school_name, school_code, email, phone, address)
            VALUES ($1::text, $2::text, $3, $4, $5)
            RETURNING id;
        `, [school.school_name, school.admission_prefix, school.school_email || null, school.school_phone || null, school.school_address || null]);
        schoolId = schoolResult.rows[0].id;
        const schoolSlug = String(school.school_name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `school-${schoolId}`;
        const settingsResult = await client.query(`
            INSERT INTO school_settings (
                school_id, school_name, website_slug, admission_prefix,
                school_email, school_phone, school_address, school_motto, school_level, is_active,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *;
        `, [schoolId, school.school_name, schoolSlug, school.admission_prefix, school.school_email || null, school.school_phone || null, school.school_address || null, school.school_motto || null, school.school_level || null]);
        const createdSchool = settingsResult.rows[0];
        const registryExists = await client.query(`SELECT to_regclass('public.school_database_registry') AS table_name`);
        if (registryExists.rows[0]?.table_name) {
            await client.query(`
                INSERT INTO school_database_registry (school_id, database_name, website_slug, is_active)
                VALUES ($1, $2, $3, FALSE)
                ON CONFLICT (school_id) DO UPDATE SET database_name = EXCLUDED.database_name, website_slug = EXCLUDED.website_slug, is_active = FALSE
            `, [schoolId, `educore_school_${schoolId}`, schoolSlug]);
        }
        const roleResult = await client.query(`SELECT id FROM roles WHERE LOWER(role_name) = 'admin' LIMIT 1;`);
        if (!roleResult.rows[0]) throw new Error("Admin role does not exist.");
        const adminResult = await client.query(`
            INSERT INTO users (username, email, password, role_id, school_id, admin_type, must_change_password, is_active)
            VALUES ($1, $2, $3, $4, $5, 'proprietor', TRUE, TRUE)
            RETURNING id, username, email, role_id, school_id, admin_type, is_active, must_change_password, created_at, updated_at;
        `, [admin.username, admin.email || null, hashedPassword, roleResult.rows[0].id, schoolId]);
        await client.query("COMMIT");
        await provisionSchoolDatabase(schoolId);
        await pool.query(`UPDATE school_database_registry SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE school_id = $1`, [schoolId]);
        return { school: createdSchool, administrator: adminResult.rows[0] };
    } catch (error) {
        try { await client.query("ROLLBACK"); } catch {}
        throw error;
    } finally { client.release(); }
};

const createSchoolAdministrator = async (schoolId, admin, hashedPassword, adminType = "proprietor") => {
    const school = await getSchoolById(schoolId);
    if (!school) return null;
    const roleResult = await pool.query(`SELECT id FROM roles WHERE LOWER(role_name) = 'admin' LIMIT 1;`);
    if (!roleResult.rows[0]) throw new Error("Admin role does not exist.");
    const result = await pool.query(`
        INSERT INTO users (username, email, password, role_id, school_id, admin_type, must_change_password, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE)
        RETURNING id, username, email, role_id, school_id, admin_type, is_active, must_change_password, created_at, updated_at;
    `, [admin.username, admin.email || null, hashedPassword, roleResult.rows[0].id, schoolId, adminType]);
    return result.rows[0];
};

module.exports = { getSchools, getSchoolById, createSchool, createSchoolAdministrator };
