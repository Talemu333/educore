require("dotenv").config();

const { Pool } = require("pg");
const { getDatabaseConfig } = require("../config/databaseConfig");

const database = require("../config/database");
const centralPool = database.centralPool || database;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9_]+$/;
const EXCLUDED_TABLES = new Set([
    "eduprow_partner_commissions",
    "eduprow_partner_leads",
    "eduprow_partner_settings",
    "eduprow_partners",
    "school_database_configs",
    "school_database_registry",
    "user_sessions",
]);
const GLOBAL_TABLES = ["roles", "states", "nationalities", "qualifications", "relationships"];
const DEPENDENT_PARENT = {
    cbt_question_options: "cbt_questions",
    cbt_question_bank_options: "cbt_question_bank",
    cbt_answers: "cbt_attempts",
};
const INSERT_ORDER = [
    "roles", "states", "nationalities", "qualifications", "relationships",
    "schools", "users", "academic_sessions", "terms", "school_settings",
    "departments", "classes", "arms", "subjects", "fee_types", "grading_systems",
    "students", "teachers", "parents", "class_subjects", "teacher_assignments",
    "student_enrollments", "student_parents", "fee_structures", "attendance",
    "student_payments", "student_results", "student_promotion_history", "notifications",
    "announcements", "expenses", "timetables", "events", "news", "gallery", "contact_messages",
    "cbt_exams", "cbt_questions", "cbt_question_options", "cbt_question_bank",
    "cbt_question_bank_options", "cbt_attempts", "cbt_attempt_questions", "cbt_answers",
    "website_pages", "website_sections",
];

const quoteIdentifier = (value) => {
    if (!IDENTIFIER_PATTERN.test(value)) throw new Error(`Unsafe PostgreSQL identifier: ${value}`);
    return `"${value}"`;
};

const getColumns = async (pool, table) => {
    const result = await pool.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position
    `, [table]);
    return result.rows.map((row) => row.column_name);
};

const getRows = async (pool, table, columns, schoolId, context) => {
    const qTable = quoteIdentifier(table);
    const qColumns = columns.map(quoteIdentifier).join(", ");
    if (table === "schools") return (await pool.query(`SELECT ${qColumns} FROM ${qTable} WHERE id = $1`, [schoolId])).rows;
    if (table === "school_settings") return (await pool.query(`SELECT ${qColumns} FROM ${qTable} WHERE school_id = $1`, [schoolId])).rows;
    if (columns.includes("school_id")) return (await pool.query(`SELECT ${qColumns} FROM ${qTable} WHERE school_id = $1`, [schoolId])).rows;
    if (GLOBAL_TABLES.includes(table)) return (await pool.query(`SELECT ${qColumns} FROM ${qTable}`)).rows;

    const parentTable = DEPENDENT_PARENT[table];
    if (parentTable) {
        const ids = context[`${parentTable}:id`] || [];
        if (ids.length) {
            const filterColumn = table === "cbt_question_bank_options" ? "bank_question_id" : table === "cbt_answers" ? "attempt_id" : "question_id";
            return (await pool.query(
                `SELECT ${qColumns} FROM ${qTable} WHERE ${quoteIdentifier(filterColumn)} = ANY($1::int[])`,
                [ids]
            )).rows;
        }
    }
    return [];
};

const insertRows = async (pool, table, columns, rows) => {
    if (!rows.length) return;
    const qTable = quoteIdentifier(table);
    const qColumns = columns.map(quoteIdentifier).join(", ");
    for (let offset = 0; offset < rows.length; offset += 100) {
        const batch = rows.slice(offset, offset + 100);
        const values = [];
        const tuples = batch.map((row, rowIndex) => {
            const placeholders = columns.map((column, columnIndex) => {
                values.push(row[column] === undefined ? null : row[column]);
                return `$${rowIndex * columns.length + columnIndex + 1}`;
            });
            return `(${placeholders.join(", ")})`;
        });
        await pool.query(`INSERT INTO ${qTable} (${qColumns}) VALUES ${tuples.join(", ")}`, values);
    }
};

const resetSequences = async (pool, tables) => {
    for (const table of tables) {
        const columns = await getColumns(pool, table);
        if (!columns.includes("id")) continue;
        const sequenceResult = await pool.query(`SELECT pg_get_serial_sequence($1, 'id') AS sequence_name`, [`public.${table}`]);
        const sequenceName = sequenceResult.rows[0]?.sequence_name;
        if (!sequenceName) continue;
        await pool.query(
            `SELECT setval($1::regclass, GREATEST(COALESCE((SELECT MAX(id) FROM ${quoteIdentifier(table)}), 1), 1), TRUE)`,
            [sequenceName]
        );
    }
};

const migrateSchoolData = async (schoolId, options = {}) => {
    if (!Number.isInteger(schoolId) || schoolId < 1) throw new Error("A valid school ID is required.");
    const registryResult = await centralPool.query(`SELECT database_name FROM school_database_registry WHERE school_id = $1 LIMIT 1`, [schoolId]);
    const databaseName = registryResult.rows[0]?.database_name;
    if (!databaseName) throw new Error(`School ${schoolId} has no database registry entry.`);

    const targetPool = new Pool(getDatabaseConfig(databaseName));
    try {
        const tableResult = await centralPool.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name
        `);
        const tables = tableResult.rows.map((row) => row.table_name).filter((table) => !EXCLUDED_TABLES.has(table));

        if (!options.force) {
            const centralUsers = await centralPool.query(`SELECT COUNT(*)::int AS count FROM users WHERE school_id = $1`, [schoolId]);
            const targetUsers = await targetPool.query(`SELECT COUNT(*)::int AS count FROM users WHERE school_id = $1`, [schoolId]);
            if ((centralUsers.rows[0]?.count || 0) <= (targetUsers.rows[0]?.count || 0)) {
                return { migrated: false, reason: "The dedicated school database is already at least as populated as the central school data." };
            }
        }

        const client = await targetPool.connect();
        try {
            await client.query("BEGIN");
            await client.query(`TRUNCATE ${tables.map(quoteIdentifier).join(", ")} CASCADE`);
            const context = {};
            const copied = {};
            for (const table of INSERT_ORDER) {
                if (!tables.includes(table)) continue;
                const columns = await getColumns(centralPool, table);
                const rows = await getRows(centralPool, table, columns, schoolId, context);
                if (!rows.length) continue;
                const insertRowsData = table === "users" && columns.includes("student_id")
                    ? rows.map((row) => ({ ...row, student_id: null }))
                    : rows;
                await insertRows(client, table, columns, insertRowsData);
                copied[table] = rows.length;
                if (columns.includes("id")) context[`${table}:id`] = rows.map((row) => row.id).filter((id) => id != null);
            }

            const studentUsers = await centralPool.query(
                `SELECT id, student_id FROM users WHERE school_id = $1 AND student_id IS NOT NULL`,
                [schoolId]
            );
            for (const row of studentUsers.rows) await client.query(`UPDATE users SET student_id = $1 WHERE id = $2`, [row.student_id, row.id]);

            await resetSequences(client, tables);
            await client.query("COMMIT");
            return { migrated: true, copied };
        } catch (error) {
            try { await client.query("ROLLBACK"); } catch {}
            throw error;
        } finally { client.release(); }
    } finally { await targetPool.end(); }
};

module.exports = { migrateSchoolData };
