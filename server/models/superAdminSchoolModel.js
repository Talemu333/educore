const pool = require("../config/database");

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
    try {
        await client.query("BEGIN");

        // school_settings.school_id is a foreign key to schools.id.
        // Create the parent school first, then create its settings row.
        const schoolResult = await client.query(`
            INSERT INTO schools (
                school_name,
                school_code,
                email,
                phone,
                address
            )
            VALUES ($1::text, $2::text, $3, $4, $5)
            RETURNING id;
        `, [
            school.school_name,
            school.admission_prefix,
            school.school_email || null,
            school.school_phone || null,
            school.school_address || null
        ]);

        const schoolId = schoolResult.rows[0].id;

        // Generate the slug in application code so the school ID parameter is
        // used only as an integer for school_settings.school_id. This avoids
        // PostgreSQL inferring the same parameter as both integer and text.
        const schoolSlug = String(school.school_name || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || `school-${schoolId}`;

        const settingsResult = await client.query(`
            INSERT INTO school_settings (
                school_id, school_name, website_slug, admission_prefix,
                school_email, school_phone, school_address,
                school_motto, school_level, is_active,
                created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *;
        `, [
            schoolId,
            school.school_name,
            schoolSlug,
            school.admission_prefix,
            school.school_email || null,
            school.school_phone || null,
            school.school_address || null,
            school.school_motto || null,
            school.school_level || null
        ]);

        const createdSchool = settingsResult.rows[0];

        const roleResult = await client.query(`SELECT id FROM roles WHERE LOWER(role_name) = 'admin' LIMIT 1;`);
        if (!roleResult.rows[0]) throw new Error("Admin role does not exist.");

        const adminResult = await client.query(`
            INSERT INTO users (username, email, password, role_id, school_id,
                               admin_type, must_change_password, is_active)
            VALUES ($1, $2, $3, $4, $5, 'proprietor', TRUE, TRUE)
            RETURNING id, username, email, role_id, school_id, admin_type,
                      is_active, must_change_password, created_at, updated_at;
        `, [admin.username, admin.email || null, hashedPassword,
            roleResult.rows[0].id, schoolId]);

        await client.query("COMMIT");
        return { school: createdSchool, administrator: adminResult.rows[0] };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const createSchoolAdministrator = async (schoolId, admin, hashedPassword, adminType = "proprietor") => {
    const school = await getSchoolById(schoolId);
    if (!school) return null;

    const roleResult = await pool.query(`SELECT id FROM roles WHERE LOWER(role_name) = 'admin' LIMIT 1;`);
    if (!roleResult.rows[0]) throw new Error("Admin role does not exist.");

    const result = await pool.query(`
        INSERT INTO users (username, email, password, role_id, school_id,
                           admin_type, must_change_password, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE)
        RETURNING id, username, email, role_id, school_id, admin_type,
                  is_active, must_change_password, created_at, updated_at;
    `, [admin.username, admin.email || null, hashedPassword,
        roleResult.rows[0].id, schoolId, adminType]);

    return result.rows[0];
};

module.exports = {
    getSchools,
    getSchoolById,
    createSchool,
    createSchoolAdministrator
};
