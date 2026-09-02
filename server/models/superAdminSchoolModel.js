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

        const schoolResult = await client.query(`
            WITH next_school AS (
                SELECT nextval(pg_get_serial_sequence('school_settings', 'id')) AS id
            )
            INSERT INTO school_settings (
                id, school_id, school_name, website_slug, admission_prefix,
                school_email, school_phone, school_address,
                school_motto, school_level, is_active,
                created_at, updated_at
            )
            SELECT id, id, $1,
                   COALESCE(NULLIF(regexp_replace(regexp_replace(lower(trim($1)), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'), ''), 'school-' || id::text),
                   $2, $3, $4, $5, $6, $7, TRUE,
                   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            FROM next_school
            RETURNING *;
        `, [school.school_name, school.admission_prefix,
            school.school_email || null, school.school_phone || null,
            school.school_address || null, school.school_motto || null,
            school.school_level || null]);

        const createdSchool = schoolResult.rows[0];

        const roleResult = await client.query(`SELECT id FROM roles WHERE LOWER(role_name) = 'admin' LIMIT 1;`);
        if (!roleResult.rows[0]) throw new Error("Admin role does not exist.");

        const adminResult = await client.query(`
            INSERT INTO users (username, email, password, role_id, school_id,
                               admin_type, must_change_password, is_active)
            VALUES ($1, $2, $3, $4, $5, 'proprietor', TRUE, TRUE)
            RETURNING id, username, email, role_id, school_id, admin_type,
                      is_active, must_change_password, created_at, updated_at;
        `, [admin.username, admin.email || null, hashedPassword,
            roleResult.rows[0].id, createdSchool.school_id]);

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

const updateSchool = async (schoolId, data) => {
    const result = await pool.query(`
        UPDATE school_settings
        SET school_name = COALESCE($1, school_name),
            admission_prefix = COALESCE($2, admission_prefix),
            school_email = $3, school_phone = $4, school_address = $5,
            school_motto = $6, school_level = $7,
            updated_at = CURRENT_TIMESTAMP
        WHERE school_id = $8 RETURNING *;
    `, [data.school_name || null, data.admission_prefix || null,
        data.school_email || null, data.school_phone || null,
        data.school_address || null, data.school_motto || null,
        data.school_level || null, schoolId]);
    return result.rows[0];
};

const setSchoolStatus = async (schoolId, isActive) => {
    const result = await pool.query(`
        UPDATE school_settings SET is_active = $1,
        updated_at = CURRENT_TIMESTAMP WHERE school_id = $2 RETURNING *;
    `, [isActive, schoolId]);
    return result.rows[0];
};

module.exports = { getSchools, getSchoolById, createSchool, createSchoolAdministrator, updateSchool, setSchoolStatus };
