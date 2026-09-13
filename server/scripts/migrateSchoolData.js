require("dotenv").config();

const { Pool } = require("pg");
const { getDatabaseConfig } = require("../config/databaseConfig");

const centralPool = require("../config/database").centralPool || require("../config/database");
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
const DEPENDENT_FILTERS = {
    cbt_question_options: ["question_id"],
    cbt_question_bank_options: ["bank_question_id"],
    cbt_answers: ["attempt_id"],
};
const INSERT_ORDER = [
    "roles", "states", "nationalities", "qualifications", "relationships",
    "schools", "school_settings",
    "users",
    "academic_sessions", "terms",
    "departments", "classes", "arms", "subjects", "fee_types", "grading_systems",
    "students", "teachers", "parents",
    "class_subjects", "teacher_assignments", "student_enrollments", "student_parents",
    "fee_structures", "attendance", "student_payments", "student_results",
    "student_promotion_history", "notifications", "announcements", "expenses", "timetables",
    "events", "news", "gallery", "contact_messages",
    "cbt_exams", "cbt_questions", "cbt_question_options", "cbt_question_bank", "cbt_question_bank_options",
    "cbt_attempts", "cbt_attempt_questions", "cbt_answers", "website_pages", "website_sections",
];

const quoteIdentifier = (value) => {
    if (!IDENTIFIER_PATTERN.test(value)) throw new Error(`Unsafe PostgreSQL identifier: ${value}`);
    return `"${value}"`;
};

const getColumns = async (pool, table) => {
    const result = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
    `, [table]);
    return result.rows.map((row) => row.column_name);
};

const getRows = async (pool, table, columns, schoolId, context) => {
    const qTable = quoteIdentifier(table);
    const qColumns = columns.map(quoteIdentifier).join(", ");

    if (table === "schools") {
        return (await pool.query(`SELECT ${qColumns} FROM ${qTable} WHERE id = $1`, [schoolId])).rows;
    }
    if (table === "school_settings") {
        return (await pool.query(`SELECT ${qColumns} FROM ${qTable} WHERE school_id = $1`, [schoolId])).rows;
    }
    if (columns.includes("school_id")) {
        return (await pool.query(`SELECT ${qColumns} FROM ${qTable} WHERE school_id = $1`, [schoolId])).rows;
    }
    if (GLOBAL_TABLES.includes(table)) {
        return (await pool.query(`SELECT ${qColumns} FROM ${qTable}`)).rows;
    }

    const filterColumns = DEPENDENT_FILTERS[table] || [];
    for (const column of filterColumns) {
        const ids = context[`${table}:${column}`] || [];
        if (ids.length) {
            return (await pool.query(
                `SELECT ${qColumns} FROM ${qTable} WHERE ${quoteIdentifier(column)} = ANY($1::int[])`,
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
    const batchSize = 100;
    for (let offset = 0; offset < rows.length; offset += batchSize) {
        const batch = rows.slice(offset, offset + batchSize);
        const values = [];
        const tuples = batch.map((row, rowIndex) => {
            const placeholders = columns.map((column, columnIndex) => {
                values.push(row[column] === undefined ? null : row[column]);
                return `$${rowIndex * columns.length + columnIndex + 1}`;
            });
            return `(${placeholders.join(", ")})`;
        });
        await pool.query(
            `INSERT INTO ${qTable} (${qColumns}) VALUES ${tuples.join(", ")}`,
            values
        );
    }
};

const resetSequences = async (pool, tables) => {
    for (const table of tables) {
        const columns = await getColumns(pool, table);
        if (!columns.includes("id")) continue;
        await pool.query(`
            SELECT setval(
                pg_get_serial_sequence($1, 'id'),
                GREATEST(COALESCE((SELECT MAX(id) FROM ${quoteIdentifier(table)}), 1), 1),
                TRUE
            )
        `, [`public.${table}`]);
    }
};

const migrateSchoolData = async (schoolId, options = {}) => {
    if (!Number.isInteger(schoolId) || schoolId < 1) throw new Error("A valid school ID is required.");

    const registryResult = await centralPool.query(`
        SELECT database_name FROM school_database_registry WHERE school_id = $1 LIMIT 1
    `, [schoolId]);
    const databaseName = registryResult.rows[0]?.database_name;
    if (!databaseName) throw new Error(`School ${schoolId} has no database registry entry.`);

    const targetPool = new Pool(getDatabaseConfig(databaseName));
    try {
        const tableResult = await centralPool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        const tables = tableResult.rows
            .map((row) => row.table_name)
            .filter((table) => !EXCLUDED_TABLES.has(table));

        if (!options.force) {
            const centralUsers = await centralPool.query(`SELECT COUNT(*)::int AS count FROM users WHERE school_id = $1`, [schoolId]);
            const targetUsers = await targetPool.query(`SELECT COUNT(*)::int AS count FROM users WHERE school_id = $1`, [schoolId]);
            if ((targetUsers.rows[0]?.count || 0) > 1 || (centralUsers.rows[0]?.count || 0) <= 1) {
                return { migrated: false, reason: "School database already contains school data or there is no additional central data to migrate." };
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

                // The users <-> students relationship is circular. Insert users first
                // without student_id, then restore it after students are copied.
                let insertColumns = columns;
                let insertRowsData = rows;
                if (table === "users" && columns.includes("student_id")) {
                    insertRowsData = rows.map((row) => ({ ...row, student_id: null }));
                }
                await insertRows(client, table, insertColumns, insertRowsData);
                copied[table] = rows.length;

                const idColumn = columns.includes("id") ? "id" : null;
                if (idColumn) context[`${table}:id`] = rows.map((row) => row[idColumn]).filter((id) => id != null);
            }

            // Restore the circular users.student_id link now that students exist.
            const users = await centralPool.query(
                `SELECT id, student_id FROM users WHERE school_id = $1 AND student_id IS NOT NULL`,
                [schoolId]
            );
            for (const row of users.rows) {
                await client.query(`UPDATE users SET student_id = $1 WHERE id = $2`, [row.student_id, row.id]);
            }

            await resetSequences(client, tables);
            await client.query("COMMIT");
            return { migrated: true, copied };
        } catch (error) {
            try { await client.query("ROLLBACK"); } catch {}
            throw error;
        } finally {
            client.release();
        }
    } finally {
        await targetPool.end();
    }
};

module.exports = { migrateSchoolData };
