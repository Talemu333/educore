const pool = require("../config/database");


/*
=========================================
GET ALL SESSIONS
=========================================
*/

const getSessions = async () => {

    const query = `
        SELECT
            id,
            session_name,
            start_date,
            end_date,
            is_current,
            created_at,
            updated_at
        FROM academic_sessions
        ORDER BY start_date DESC;
    `;

    const result = await pool.query(query);

    return result.rows;

};


/*
=========================================
GET SESSION BY ID
=========================================
*/

const getSessionById = async (id) => {

    const result = await pool.query(
        `
        SELECT *
        FROM academic_sessions
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];

};


/*
=========================================
CREATE SESSION
=========================================
*/

const createSession = async ({
    session_name,
    start_date,
    end_date
}) => {

    const result = await pool.query(
        `
        INSERT INTO academic_sessions (
            session_name,
            start_date,
            end_date
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [
            session_name,
            start_date,
            end_date
        ]
    );

    return result.rows[0];

};


/*
=========================================
UPDATE SESSION
=========================================
*/

const updateSession = async (
    id,
    {
        session_name,
        start_date,
        end_date
    }
) => {

    const result = await pool.query(
        `
        UPDATE academic_sessions
        SET
            session_name = $1,
            start_date = $2,
            end_date = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
        `,
        [
            session_name,
            start_date,
            end_date,
            id
        ]
    );

    return result.rows[0];

};


/*
=========================================
SET CURRENT SESSION
=========================================
*/

const setCurrentSession = async (sessionId) => {

    const client = await pool.connect();

    try {

        /*
        =========================================
        START TRANSACTION
        =========================================
        */

        await client.query("BEGIN");


        /*
        =========================================
        VERIFY SESSION EXISTS
        =========================================
        */

        const sessionResult = await client.query(
            `
            SELECT *
            FROM academic_sessions
            WHERE id = $1
            `,
            [sessionId]
        );


        if (sessionResult.rows.length === 0) {

            const error = new Error(
                "Academic session not found."
            );

            error.statusCode = 404;

            throw error;

        }


        /*
        =========================================
        REMOVE CURRENT STATUS FROM ALL SESSIONS
        =========================================
        */

        await client.query(
            `
            UPDATE academic_sessions
            SET
                is_current = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE is_current = true
            `
        );


        /*
        =========================================
        MAKE SELECTED SESSION CURRENT
        =========================================
        */

        const updatedSessionResult =
            await client.query(
                `
                UPDATE academic_sessions
                SET
                    is_current = true,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
                `,
                [sessionId]
            );


        /*
        =========================================
        UPDATE SCHOOL SETTINGS
        =========================================

        IMPORTANT:
        This keeps school_settings.current_session_id
        synchronized with academic_sessions.is_current.
        =========================================
        */

        await client.query(
            `
            UPDATE school_settings
            SET
                current_session_id = $1,
                updated_at = CURRENT_TIMESTAMP
            `,
            [sessionId]
        );


        /*
        =========================================
        COMMIT
        =========================================
        */

        await client.query("COMMIT");


        return updatedSessionResult.rows[0];

    } catch (error) {

        /*
        =========================================
        ROLLBACK
        =========================================
        */

        await client.query("ROLLBACK");

        throw error;

    } finally {

        /*
        =========================================
        RELEASE CONNECTION
        =========================================
        */

        client.release();

    }

};


/*
=========================================
EXPORT
=========================================
*/

module.exports = {

    getSessions,

    getSessionById,

    createSession,

    updateSession,

    setCurrentSession

};