require("dotenv").config();

const pool = require("../config/database");

const bootstrapAcademicData = async () => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const schoolsResult = await client.query(
            `SELECT id FROM schools ORDER BY id`
        );

        const sourceClassesResult = await client.query(
            `
            SELECT id, class_name, class_level, sort_order
            FROM classes
            WHERE school_id = 1
            ORDER BY sort_order, id
            `
        );

        const sourceTermsResult = await client.query(
            `
            SELECT
                t.term_name,
                t.start_date,
                t.end_date,
                t.is_current,
                t.session_id,
                s.session_name,
                s.start_date AS session_start_date
            FROM terms t
            INNER JOIN academic_sessions s
                ON s.id = t.session_id
               AND s.school_id = t.school_id
            WHERE t.school_id = 1
            ORDER BY s.start_date, t.start_date, t.id
            `
        );

        if (!sourceClassesResult.rowCount) {
            throw new Error(
                "School 1 has no classes to use as the canonical academic structure."
            );
        }

        if (!sourceTermsResult.rowCount) {
            throw new Error(
                "School 1 has no terms to use as the canonical academic structure."
            );
        }

        const sourceArmsResult = await client.query(
            `
            SELECT
                a.arm_name,
                c.class_name
            FROM arms a
            INNER JOIN classes c
                ON c.id = a.class_id
               AND c.school_id = 1
            WHERE a.school_id = 1
            ORDER BY c.sort_order, a.arm_name
            `
        );

        let classesCreated = 0;
        let armsCreated = 0;
        let termsCreated = 0;
        let settingsUpdated = 0;

        for (const school of schoolsResult.rows) {
            if (Number(school.id) === 1) {
                continue;
            }

            const targetClassMap = new Map();

            for (const sourceClass of sourceClassesResult.rows) {
                const classResult = await client.query(
                    `
                    INSERT INTO classes (
                        school_id,
                        class_name,
                        class_level,
                        sort_order
                    )
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (school_id, class_name)
                    DO UPDATE SET
                        class_level = EXCLUDED.class_level,
                        sort_order = EXCLUDED.sort_order
                    RETURNING id, class_name
                    `,
                    [
                        school.id,
                        sourceClass.class_name,
                        sourceClass.class_level,
                        sourceClass.sort_order
                    ]
                );

                targetClassMap.set(
                    sourceClass.class_name,
                    classResult.rows[0].id
                );

                if (classResult.command === "INSERT") {
                    classesCreated++;
                }
            }

            for (const sourceArm of sourceArmsResult.rows) {
                const targetClassId = targetClassMap.get(
                    sourceArm.class_name
                );

                if (!targetClassId) {
                    continue;
                }

                const armResult = await client.query(
                    `
                    INSERT INTO arms (
                        school_id,
                        class_id,
                        arm_name
                    )
                    VALUES ($1, $2, $3)
                    ON CONFLICT (school_id, arm_name)
                    DO NOTHING
                    RETURNING id
                    `,
                    [
                        school.id,
                        targetClassId,
                        sourceArm.arm_name
                    ]
                );

                if (armResult.rowCount) {
                    armsCreated++;
                }
            }

            const targetSessionsResult = await client.query(
                `
                SELECT id, session_name, start_date, is_current
                FROM academic_sessions
                WHERE school_id = $1
                ORDER BY start_date, id
                `,
                [school.id]
            );

            for (const targetSession of targetSessionsResult.rows) {
                const sourceSessionTerms = sourceTermsResult.rows.filter(
                    (term) =>
                        term.session_name === targetSession.session_name
                );

                const fallbackTerms = sourceTermsResult.rows.filter(
                    (term) =>
                        term.session_id === sourceTermsResult.rows[0].session_id
                );

                const termsToCopy =
                    sourceSessionTerms.length > 0
                        ? sourceSessionTerms
                        : fallbackTerms;

                if (!termsToCopy.length) {
                    continue;
                }

                const currentTermResult = await client.query(
                    `
                    SELECT id
                    FROM terms
                    WHERE school_id = $1
                      AND session_id = $2
                      AND is_current = TRUE
                    LIMIT 1
                    `,
                    [school.id, targetSession.id]
                );

                let hasCurrentTerm = currentTermResult.rowCount > 0;

                for (const sourceTerm of termsToCopy) {
                    const startDate = new Date(targetSession.start_date);
                    const sourceSessionStart = new Date(
                        sourceTerm.session_start_date
                    );
                    const sourceTermStart = new Date(sourceTerm.start_date);
                    const sourceTermEnd = new Date(sourceTerm.end_date);

                    const startOffset =
                        sourceTermStart.getTime() -
                        sourceSessionStart.getTime();

                    const endOffset =
                        sourceTermEnd.getTime() -
                        sourceSessionStart.getTime();

                    const targetStartDate = new Date(
                        startDate.getTime() + startOffset
                    );

                    const targetEndDate = new Date(
                        startDate.getTime() + endOffset
                    );

                    const shouldBeCurrent =
                        !hasCurrentTerm &&
                        Boolean(sourceTerm.is_current) &&
                        Boolean(targetSession.is_current);

                    const termResult = await client.query(
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
                        ON CONFLICT (school_id, session_id, term_name)
                        DO NOTHING
                        RETURNING id, is_current
                        `,
                        [
                            school.id,
                            targetSession.id,
                            sourceTerm.term_name,
                            targetStartDate.toISOString().slice(0, 10),
                            targetEndDate.toISOString().slice(0, 10),
                            shouldBeCurrent
                        ]
                    );

                    if (termResult.rowCount) {
                        termsCreated++;

                        if (termResult.rows[0].is_current) {
                            hasCurrentTerm = true;
                        }
                    }
                }
            }

            const currentSessionSettingsResult = await client.query(
                `
                SELECT current_session_id, current_term_id
                FROM school_settings
                WHERE school_id = $1
                LIMIT 1
                `,
                [school.id]
            );

            if (currentSessionSettingsResult.rowCount) {
                const settings = currentSessionSettingsResult.rows[0];

                const currentSessionId =
                    settings.current_session_id ||
                    (
                        await client.query(
                            `
                            SELECT id
                            FROM academic_sessions
                            WHERE school_id = $1
                              AND is_current = TRUE
                            ORDER BY start_date DESC, id DESC
                            LIMIT 1
                            `,
                            [school.id]
                        )
                    ).rows[0]?.id;

                if (currentSessionId) {
                    const currentTerm = await client.query(
                        `
                        SELECT id
                        FROM terms
                        WHERE school_id = $1
                          AND session_id = $2
                          AND is_current = TRUE
                        ORDER BY start_date, id
                        LIMIT 1
                        `,
                        [school.id, currentSessionId]
                    );

                    if (currentTerm.rowCount) {
                        const updateResult = await client.query(
                            `
                            UPDATE school_settings
                            SET current_session_id = $1,
                                current_term_id = COALESCE(current_term_id, $2),
                                updated_at = CURRENT_TIMESTAMP
                            WHERE school_id = $3
                            `,
                            [
                                currentSessionId,
                                currentTerm.rows[0].id,
                                school.id
                            ]
                        );

                        settingsUpdated += updateResult.rowCount;
                    }
                }
            }
        }

        await client.query("COMMIT");

        console.log("Academic bootstrap completed successfully.");
        console.log({
            schoolsProcessed: Math.max(schoolsResult.rowCount - 1, 0),
            classesCreated,
            armsCreated,
            termsCreated,
            settingsUpdated
        });
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

bootstrapAcademicData().catch((error) => {
    console.error("Academic bootstrap failed:", error);
    process.exit(1);
});
