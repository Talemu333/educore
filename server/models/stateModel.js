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

// State IDs are database-local because students.state_id has a foreign key
// to the states table in the same database. The central table remains the
// master list, but each isolated school database must resolve the same state
// names to its own local IDs. Never copy central IDs over existing tenant IDs:
// doing so could silently change the meaning of state_id on existing students.
const syncStatesToActiveDatabase = async (masterStates) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS states (
            id SERIAL PRIMARY KEY,
            state_name VARCHAR(100) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const existingResult = await pool.query(
        "SELECT id, state_name FROM states ORDER BY id"
    );
    const existingNames = new Set(
        existingResult.rows.map((state) => String(state.state_name).trim().toLowerCase())
    );

    for (const state of masterStates) {
        const normalizedName = String(state.state_name).trim();
        if (existingNames.has(normalizedName.toLowerCase())) continue;

        await pool.query(
            `INSERT INTO states (state_name)
             VALUES ($1)
             ON CONFLICT (state_name) DO NOTHING`,
            [normalizedName]
        );
        existingNames.add(normalizedName.toLowerCase());
    }

    const localResult = await pool.query(
        "SELECT id, state_name FROM states ORDER BY id"
    );
    const localByName = new Map();
    for (const state of localResult.rows) {
        const key = String(state.state_name).trim().toLowerCase();
        if (!localByName.has(key)) localByName.set(key, state);
    }

    return masterStates
        .map((state) => localByName.get(String(state.state_name).trim().toLowerCase()))
        .filter(Boolean)
        .map((state) => ({ id: state.id, state_name: state.state_name }));
};

const getStates = async () => {
    await ensureStatesTable();
    const masterResult = await pool.centralPool.query(
        "SELECT id, state_name FROM states ORDER BY state_name"
    );

    // Return tenant-local IDs so submitted state_id values satisfy the
    // students -> states foreign key in the active school database.
    const localStates = await syncStatesToActiveDatabase(masterResult.rows);
    const localByName = new Map(
        localStates.map((state) => [String(state.state_name).trim().toLowerCase(), state])
    );

    return masterResult.rows
        .map((state) => localByName.get(String(state.state_name).trim().toLowerCase()))
        .filter(Boolean)
        .sort((a, b) => a.state_name.localeCompare(b.state_name));
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

    let state = result.rows[0];
    let created = Boolean(state);
    if (!state) {
        const existing = await pool.centralPool.query(
            "SELECT id, state_name FROM states WHERE LOWER(state_name) = LOWER($1) LIMIT 1",
            [normalizedName]
        );
        state = existing.rows[0];
    }

    const localStates = await syncStatesToActiveDatabase([state]);
    return { state: localStates[0] || state, created };
};

module.exports = { getStates, createState };
