const database = require("../config/database");
const pool = database.centralPool;
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { migrateSchoolData } = require("../scripts/migrateSchoolData");
const { getSchoolDatabase } = require("../config/schoolDatabaseManager");

const execFileAsync = promisify(execFile);
const provisionerPath = path.resolve(__dirname, "../scripts/provisionSchoolDatabase.js");

const provisionSchoolDatabase = async (schoolId) => {
    try {
        await execFileAsync(process.execPath, [provisionerPath, String(schoolId)], {
            cwd: path.resolve(__dirname, ".."), env: process.env, maxBuffer: 10 * 1024 * 1024,
        });
    } catch (error) {
        const output = [error?.stdout, error?.stderr, error?.message].filter(Boolean).join("\n").trim();
        const provisioningError = new Error(`School database provisioning failed for school ${schoolId}.${output ? ` ${output}` : ""}`);
        provisioningError.status = 503; provisioningError.cause = error; throw provisioningError;
    }
};

const getSchools = async () => {
    const result = await pool.query(`
        SELECT ss.school_id, ss.school_name, ss.website_slug, ss.admission_prefix,
               ss.school_email, ss.school_phone, ss.school_address, ss.school_logo,
               ss.school_level, ss.school_motto, ss.is_active, ss.created_at, ss.updated_at,
               (SELECT sub.student_count FROM platform_school_subscriptions sub
                WHERE sub.school_id = ss.school_id
                ORDER BY CASE WHEN sub.status = 'active' THEN 0 ELSE 1 END,
                         sub.created_at DESC, sub.id DESC LIMIT 1) AS agreed_student_limit
        FROM school_settings ss
        ORDER BY ss.school_id;
    `);

    // Only School 1 contains legacy central data that should be migrated.
    // Every other school, including future schools, stays on its fresh dedicated DB.
    const LEGACY_MIGRATION_SCHOOL_ID = 1;

    for (const school of result.rows) {
        try {
            const registryResult = await pool.query(`
                SELECT database_name, is_active FROM school_database_registry
                WHERE school_id = $1 LIMIT 1
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

            // Deliberately restricted to School 1. Do not copy central legacy data
            // into School 3, School 6, or any newly created school.
            if (school.school_id === LEGACY_MIGRATION_SCHOOL_ID) {
                await migrateSchoolData(LEGACY_MIGRATION_SCHOOL_ID);
            }
        } catch (error) {
            console.warn(`School database recovery skipped for school ${school.school_id}: ${error.message}`);
        }
    }

    // Count each entity independently. A schema mismatch in one table/column must
    // not blank every count for that school in the Super Admin table.
    const safeCount = async (schoolId, schoolPool, label, sql, values = []) => {
        try {
            const result = await schoolPool.query(sql, values);
            return result.rows[0] || {};
        } catch (error) {
            console.warn(`Unable to load ${label} for school ${schoolId}: ${error.message}`);
            return null;
        }
    };

    for (const school of result.rows) {
        const schoolId = school.school_id;
        try {
            const registryResult = await pool.query(
                `SELECT database_name, is_active FROM school_database_registry WHERE school_id = $1 LIMIT 1`,
                [schoolId]
            );
            const registry = registryResult.rows[0];
            const schoolPool = await getSchoolDatabase(schoolId);
            const isDedicatedDatabase = Boolean(
                registry?.is_active &&
                registry.database_name &&
                registry.database_name !== process.env.DB_NAME
            );
            const scope = (alias = "") => isDedicatedDatabase ? "" : ` WHERE ${alias ? `${alias}.` : ""}school_id = $1`;
            const values = isDedicatedDatabase ? [] : [schoolId];

            const studentTotal = await safeCount(schoolId, schoolPool, "student total",
                `SELECT COUNT(*)::INTEGER AS total FROM students${scope()}`, values);
            const studentActive = await safeCount(schoolId, schoolPool, "active student count",
                `SELECT COUNT(*)::INTEGER AS total FROM students WHERE LOWER(TRIM(COALESCE(status::text, ''))) = 'active' ${isDedicatedDatabase ? "" : "AND school_id = $1"}`, values);
            const studentInactive = await safeCount(schoolId, schoolPool, "inactive student count",
                `SELECT COUNT(*)::INTEGER AS total FROM students WHERE (LOWER(TRIM(COALESCE(status::text, ''))) <> 'active' OR status IS NULL) ${isDedicatedDatabase ? "" : "AND school_id = $1"}`, values);

            const teacherTotal = await safeCount(schoolId, schoolPool, "teacher total",
                `SELECT COUNT(*)::INTEGER AS total FROM teachers${scope()}`, values);
            const teacherActive = await safeCount(schoolId, schoolPool, "active teacher count",
                `SELECT COUNT(*)::INTEGER AS total FROM teachers WHERE status::text IN ('true', 't', '1', 'active', 'Active') ${isDedicatedDatabase ? "" : "AND school_id = $1"}`, values);
            const teacherInactive = await safeCount(schoolId, schoolPool, "inactive teacher count",
                `SELECT COUNT(*)::INTEGER AS total FROM teachers WHERE status IS NULL OR status::text NOT IN ('true', 't', '1', 'active', 'Active') ${isDedicatedDatabase ? "" : "AND school_id = $1"}`, values);

            const parentScope = isDedicatedDatabase ? "" : "AND p.school_id = $1";
            const parentTotal = await safeCount(schoolId, schoolPool, "parent total",
                `SELECT COUNT(*)::INTEGER AS total FROM parents p WHERE TRUE ${parentScope}`, values);
            const parentActive = await safeCount(schoolId, schoolPool, "active parent count",
                `SELECT COUNT(*)::INTEGER AS total FROM parents p JOIN users u ON u.id = p.user_id WHERE u.is_active IS TRUE ${parentScope}`, values);
            const parentInactive = await safeCount(schoolId, schoolPool, "inactive parent count",
                `SELECT COUNT(*)::INTEGER AS total FROM parents p LEFT JOIN users u ON u.id = p.user_id WHERE u.is_active IS NOT TRUE ${parentScope}`, values);

            const adminScope = isDedicatedDatabase ? "" : "AND u.school_id = $1";
            const adminTotal = await safeCount(schoolId, schoolPool, "administrator total",
                `SELECT COUNT(*)::INTEGER AS total FROM users u JOIN roles r ON r.id = u.role_id WHERE LOWER(TRIM(r.role_name)) IN ('admin', 'administrator') ${adminScope}`, values);
            const adminActive = await safeCount(schoolId, schoolPool, "active administrator count",
                `SELECT COUNT(*)::INTEGER AS total FROM users u JOIN roles r ON r.id = u.role_id WHERE LOWER(TRIM(r.role_name)) IN ('admin', 'administrator') AND u.is_active IS TRUE ${adminScope}`, values);
            const adminInactive = await safeCount(schoolId, schoolPool, "inactive administrator count",
                `SELECT COUNT(*)::INTEGER AS total FROM users u JOIN roles r ON r.id = u.role_id WHERE LOWER(TRIM(r.role_name)) IN ('admin', 'administrator') AND u.is_active IS NOT TRUE ${adminScope}`, values);

            const assignCount = (key, result) => { school[key] = result ? Number(result.total) : null; };
            assignCount("student_count", studentTotal);
            assignCount("active_student_count", studentActive);
            assignCount("inactive_student_count", studentInactive);
            assignCount("teacher_count", teacherTotal);
            assignCount("active_teacher_count", teacherActive);
            assignCount("inactive_teacher_count", teacherInactive);
            assignCount("parent_count", parentTotal);
            assignCount("active_parent_count", parentActive);
            assignCount("inactive_parent_count", parentInactive);
            assignCount("admin_count", adminTotal);
            assignCount("active_admin_count", adminActive);
            assignCount("inactive_admin_count", adminInactive);

            school.user_count = [school.student_count, school.teacher_count, school.parent_count, school.admin_count]
                .every((count) => count !== null)
                ? school.student_count + school.teacher_count + school.parent_count + school.admin_count
                : null;
        } catch (error) {
            console.warn(`Unable to resolve registered records for school ${schoolId}: ${error.message}`);
            Object.assign(school, {
                user_count: null,
                student_count: null, active_student_count: null, inactive_student_count: null,
                teacher_count: null, active_teacher_count: null, inactive_teacher_count: null,
                parent_count: null, active_parent_count: null, inactive_parent_count: null,
                admin_count: null, active_admin_count: null, inactive_admin_count: null
            });
        }
    }

    return result.rows;
};

const getSchoolById = async (schoolId) => {
    const result = await pool.query(`
        SELECT ss.*, COUNT(u.id)::INTEGER AS user_count FROM school_settings ss
        LEFT JOIN users u ON u.school_id = ss.school_id
        WHERE ss.school_id = $1 GROUP BY ss.id LIMIT 1;
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
            VALUES ($1::text, $2::text, $3, $4, $5) RETURNING id;
        `, [school.school_name, school.admission_prefix, school.school_email || null, school.school_phone || null, school.school_address || null]);
        schoolId = schoolResult.rows[0].id;
        const schoolSlug = String(school.school_name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `school-${schoolId}`;
        const settingsResult = await client.query(`
            INSERT INTO school_settings (
                school_id, school_name, website_slug, admission_prefix, school_email,
                school_phone, school_address, school_motto, school_level, is_active,
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
                ON CONFLICT (school_id) DO UPDATE SET database_name = EXCLUDED.database_name,
                    website_slug = EXCLUDED.website_slug, is_active = FALSE
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
