const pool = require("../config/database");

const getSessions = async (schoolId) => {
    const result = await pool.query(`
        SELECT id, session_name, start_date, end_date, is_current, created_at, updated_at
        FROM academic_sessions
        WHERE school_id = $1
        ORDER BY start_date DESC;
    `, [schoolId]);
    return result.rows;
};

const getSessionById = async (id, schoolId) => {
    const result = await pool.query(`
        SELECT *
        FROM academic_sessions
        WHERE id = $1 AND school_id = $2
    `, [id, schoolId]);
    return result.rows[0];
};

const createSession = async ({ session_name, start_date, end_date }, schoolId) => {
    const result = await pool.query(`
        INSERT INTO academic_sessions (session_name, start_date, end_date, school_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [session_name, start_date, end_date, schoolId]);
    return result.rows[0];
};

const updateSession = async (id, { session_name, start_date, end_date }, schoolId) => {
    const result = await pool.query(`
        UPDATE academic_sessions
        SET session_name = $1, start_date = $2, end_date = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND school_id = $5
        RETURNING *
    `, [session_name, start_date, end_date, id, schoolId]);
    return result.rows[0];
};

const setCurrentSession = async (sessionId, schoolId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const sessionResult = await client.query(`
            SELECT * FROM academic_sessions
            WHERE id = $1 AND school_id = $2
        `, [sessionId, schoolId]);

        if (sessionResult.rows.length === 0) {
            const error = new Error("Academic session not found.");
            error.statusCode = 404;
            throw error;
        }

        await client.query(`
            UPDATE academic_sessions
            SET is_current = false, updated_at = CURRENT_TIMESTAMP
            WHERE school_id = $1
        `, [schoolId]);

        const updatedSessionResult = await client.query(`
            UPDATE academic_sessions
            SET is_current = true, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND school_id = $2
            RETURNING *
        `, [sessionId, schoolId]);

        await client.query(`
            UPDATE school_settings
            SET current_session_id = $1, updated_at = CURRENT_TIMESTAMP
            WHERE school_id = $2
        `, [sessionId, schoolId]);

        await client.query("COMMIT");
        return updatedSessionResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    getSessions,
    getSessionById,
    createSession,
    updateSession,
    setCurrentSession
};