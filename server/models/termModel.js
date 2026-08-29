const pool = require("../config/database");

const getTerms = async (schoolId) => {
    const query = `
        SELECT
            t.id,
            t.term_name,
            t.start_date,
            t.end_date,
            t.is_current,
            t.session_id,
            s.session_name
        FROM terms t
        INNER JOIN academic_sessions s
            ON t.session_id = s.id
           AND t.school_id = s.school_id
        WHERE t.school_id = $1
        ORDER BY s.start_date DESC, t.start_date ASC;
    `;

    const result = await pool.query(query, [schoolId]);
    return result.rows;
};

const getTermById = async (id, schoolId) => {
    const result = await pool.query(
        `
        SELECT *
        FROM terms
        WHERE id = $1
          AND school_id = $2
        `,
        [id, schoolId]
    );

    return result.rows[0];
};

const createTerm = async (data, schoolId) => {
    const {
        session_id,
        term_name,
        start_date,
        end_date,
        is_current = false
    } = data;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const sessionResult = await client.query(
            `
            SELECT id
            FROM academic_sessions
            WHERE id = $1
              AND school_id = $2
            FOR UPDATE
            `,
            [session_id, schoolId]
        );

        if (sessionResult.rowCount === 0) {
            const error = new Error("Academic session not found for this school.");
            error.statusCode = 404;
            throw error;
        }

        if (is_current) {
            await client.query(
                `
                UPDATE terms
                SET is_current = FALSE,
                    updated_at = CURRENT_TIMESTAMP
                WHERE school_id = $1
                  AND session_id = $2
                `,
                [schoolId, session_id]
            );
        }

        const result = await client.query(
            `
            INSERT INTO terms (
                school_id,
                session_id,
                term_name,
                start_date,
                end_date,
                is_current
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                id,
                school_id,
                session_id,
                term_name,
                start_date,
                end_date,
                is_current,
                created_at,
                updated_at
            `,
            [schoolId, session_id, term_name, start_date, end_date, is_current]
        );

        await client.query("COMMIT");
        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    getTerms,
    getTermById,
    createTerm
};
