const pool = require("../config/database");

let ensureStatesTablePromise;

const ensureStatesTable = async () => {
    if (!ensureStatesTablePromise) {
        ensureStatesTablePromise = (async () => {
            await pool.centralPool.query(`
                CREATE TABLE IF NOT EXISTS states (
                    id SERIAL PRIMARY KEY,
                    state_name VARCHAR(100) NOT NULL UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            await pool.centralPool.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS states_state_name_lower_unique
                ON states (LOWER(state_name))
            `);
            await pool.centralPool.query(`
                INSERT INTO states (state_name)
                VALUES ('Lagos'), ('Oyo'), ('Ogun'), ('Abuja')
                ON CONFLICT (state_name) DO NOTHING
            `);
        })().catch((error) => {
            ensureStatesTablePromise = null;
            throw error;
        });
    }
    return ensureStatesTablePromise;
};

const getStates = async () => {
    await ensureStatesTable();
    const result = await pool.centralPool.query(
        "SELECT id, state_name FROM states ORDER BY state_name"
    );
    return result.rows;
};

const createState = async (stateName) => {
    await ensureStatesTable();
    const normalizedName = stateName.trim().replace(/\\s+/g, " ");
    const result = await pool.centralPool.query(
        `INSERT INTO states (state_name)
         VALUES ($1)
         ON CONFLICT (LOWER(state_name)) DO NOTHING
         RETURNING id, state_name`,
        [normalizedName]
    );
    if (result.rows[0]) return { state: result.rows[0], created: true };

    const existing = await pool.centralPool.query(
        "SELECT id, state_name FROM states WHERE LOWER(state_name) = LOWER($1) LIMIT 1",
        [normalizedName]
    );
    return { state: existing.rows[0], created: false };
};

module.exports = { getStates, createState };
