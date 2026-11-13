const pool = require("../config/database");

const listProgrammes = async (classId, schoolId, database = pool) => {
    const result = await database.query(`
        SELECT p.id, p.class_id, p.programme_name, p.programme_code, p.description, p.is_active,
               COUNT(ps.subject_id)::integer AS subject_count
        FROM academic_programmes p
        LEFT JOIN academic_programme_subjects ps
          ON ps.programme_id = p.id AND ps.school_id = p.school_id
        JOIN classes c ON c.id = p.class_id AND c.school_id = p.school_id
        WHERE p.school_id = $1
          AND ($2::integer IS NULL OR p.class_id = $2)
        GROUP BY p.id
        ORDER BY c.sort_order, p.programme_name
    `, [schoolId, classId || null]);
    return result.rows;
};

const createProgramme = async (data, schoolId, database = pool) => {
    const result = await database.query(`
        INSERT INTO academic_programmes
            (school_id, class_id, programme_name, programme_code, description)
        SELECT $1, c.id, $3, $4, $5
        FROM classes c
        WHERE c.id = $2 AND c.school_id = $1 AND LOWER(c.class_level) = 'senior'
        RETURNING *
    `, [schoolId, data.class_id, data.programme_name.trim(), data.programme_code || null, data.description || null]);
    return result.rows[0];
};

const getProgramme = async (programmeId, schoolId, database = pool) => {
    const result = await database.query(`
        SELECT p.*, c.class_name, c.class_level
        FROM academic_programmes p
        JOIN classes c ON c.id = p.class_id AND c.school_id = p.school_id
        WHERE p.id = $1 AND p.school_id = $2
    `, [programmeId, schoolId]);
    return result.rows[0];
};

const getProgrammeSubjects = async (programmeId, schoolId, database = pool) => {
    const result = await database.query(`
        SELECT s.id AS subject_id, s.subject_name, s.subject_code, ps.is_compulsory
        FROM academic_programme_subjects ps
        JOIN academic_programmes p ON p.id = ps.programme_id AND p.school_id = ps.school_id
        JOIN subjects s ON s.id = ps.subject_id AND s.school_id = ps.school_id
        WHERE ps.programme_id = $1 AND ps.school_id = $2
        ORDER BY s.subject_name
    `, [programmeId, schoolId]);
    return result.rows;
};

const saveProgrammeSubjects = async (programmeId, subjects, schoolId, database = pool) => {
    const client = await database.connect();
    try {
        await client.query("BEGIN");
        const programme = await getProgramme(programmeId, schoolId, client);
        if (!programme) throw Object.assign(new Error("Programme not found."), { statusCode: 404 });

        const ids = [...new Set(subjects.map(item => Number(item.subject_id)))];
        if (ids.length !== subjects.length) throw Object.assign(new Error("Duplicate subjects are not allowed."), { statusCode: 400 });

        if (ids.length) {
            const valid = await client.query(`
                SELECT id FROM subjects
                WHERE school_id = $1 AND id = ANY($2::integer[])
            `, [schoolId, ids]);
            if (valid.rowCount !== ids.length) throw Object.assign(new Error("One or more selected subjects do not belong to this school."), { statusCode: 400 });
        }

        const used = await client.query(`
            SELECT 1
            FROM student_subject_enrollments
            WHERE programme_id = $1 AND school_id = $2 AND status = 'Active'
            LIMIT 1
        `, [programmeId, schoolId]);
        if (used.rowCount) {
            const changed = await client.query(`
                SELECT 1 FROM student_subject_enrollments
                WHERE programme_id = $1 AND school_id = $2 AND status = 'Active'
                  AND subject_id <> ALL($3::integer[])
                LIMIT 1
            `, [programmeId, schoolId, ids]);
            if (changed.rowCount) throw Object.assign(new Error("This programme already has enrolled students. Do not remove an offered subject while students are enrolled; end the current session or create a new programme offering."), { statusCode: 409 });
        }

        await client.query("DELETE FROM academic_programme_subjects WHERE programme_id = $1 AND school_id = $2", [programmeId, schoolId]);
        for (const item of subjects) {
            await client.query(`
                INSERT INTO academic_programme_subjects
                    (school_id, programme_id, subject_id, is_compulsory)
                VALUES ($1, $2, $3, $4)
            `, [schoolId, programmeId, Number(item.subject_id), item.is_compulsory !== false]);
        }
        await client.query("COMMIT");
        return await getProgrammeSubjects(programmeId, schoolId, database);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const getStudentsForProgrammeAssignment = async ({ classId, sessionId, schoolId }, database = pool) => {
    const result = await database.query(`
        SELECT s.id, s.admission_number, s.surname, s.first_name, s.middle_name,
               COALESCE(a.arm_name, '') AS arm_name,
               spe.programme_id,
               p.programme_name,
               COUNT(sse.id) FILTER (WHERE sse.status = 'Active')::integer AS active_subject_count
        FROM student_enrollments se
        JOIN students s ON s.id = se.student_id AND s.school_id = $3
        LEFT JOIN arms a ON a.id = se.arm_id AND a.school_id = $3
        LEFT JOIN student_programme_enrollments spe
          ON spe.student_id = s.id AND spe.session_id = se.session_id
         AND spe.school_id = $3 AND spe.status = 'Active'
        LEFT JOIN academic_programmes p
          ON p.id = spe.programme_id AND p.school_id = $3
        LEFT JOIN student_subject_enrollments sse
          ON sse.student_id = s.id AND sse.session_id = se.session_id
         AND sse.school_id = $3 AND sse.status = 'Active'
        WHERE se.class_id = $1 AND se.session_id = $2
          AND se.enrollment_status = 'Active'
        GROUP BY s.id, a.arm_name, spe.programme_id, p.programme_name
        ORDER BY s.surname, s.first_name
    `, [classId, sessionId, schoolId]);
    return result.rows;
};

const assignStudents = async ({ classId, sessionId, programmeId, studentIds, subjectIds, assignedBy }, schoolId, database = pool) => {
    const client = await database.connect();
    try {
        await client.query("BEGIN");
        const programme = await getProgramme(programmeId, schoolId, client);
        if (!programme || Number(programme.class_id) !== Number(classId)) {
            throw Object.assign(new Error("The selected programme does not belong to this class and school."), { statusCode: 400 });
        }
        const validStudents = await client.query(`
            SELECT s.id
            FROM students s
            JOIN student_enrollments se ON se.student_id = s.id
            WHERE s.school_id = $1 AND se.session_id = $2 AND se.class_id = $3
              AND se.enrollment_status = 'Active'
              AND s.id = ANY($4::integer[])
        `, [schoolId, sessionId, classId, studentIds]);
        if (validStudents.rowCount !== studentIds.length) {
            throw Object.assign(new Error("One or more selected students are not actively enrolled in the selected class and session."), { statusCode: 400 });
        }

        const allowed = await client.query(`
            SELECT subject_id FROM academic_programme_subjects
            WHERE programme_id = $1 AND school_id = $2
        `, [programmeId, schoolId]);
        const allowedIds = new Set(allowed.rows.map(row => Number(row.subject_id)));
        const selectedIds = [...new Set(subjectIds.map(Number))];
        if (!selectedIds.length || selectedIds.some(id => !allowedIds.has(id))) {
            throw Object.assign(new Error("Select one or more subjects offered by the chosen programme."), { statusCode: 400 });
        }

        const existingResults = await client.query(`
            SELECT 1
            FROM student_results sr
            JOIN students s ON s.id = sr.student_id AND s.school_id = $1
            WHERE sr.student_id = ANY($2::integer[]) AND sr.session_id = $3
            LIMIT 1
        `, [schoolId, studentIds, sessionId]);
        if (existingResults.rowCount) {
            throw Object.assign(new Error("These students already have result records in this session. Their programme/subjects cannot be changed through bulk assignment because that could alter existing academic history."), { statusCode: 409 });
        }

        await client.query(`
            UPDATE student_subject_enrollments
            SET status = 'Ended', ended_at = CURRENT_TIMESTAMP
            WHERE school_id = $1 AND session_id = $2
              AND student_id = ANY($3::integer[]) AND status = 'Active'
        `, [schoolId, sessionId, studentIds]);
        await client.query(`
            UPDATE student_programme_enrollments
            SET status = 'Ended', ended_at = CURRENT_TIMESTAMP
            WHERE school_id = $1 AND session_id = $2
              AND student_id = ANY($3::integer[]) AND status = 'Active'
        `, [schoolId, sessionId, studentIds]);

        for (const studentId of studentIds) {
            await client.query(`
                INSERT INTO student_programme_enrollments
                    (school_id, student_id, session_id, class_id, programme_id, assigned_by)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [schoolId, studentId, sessionId, classId, programmeId, assignedBy || null]);
            for (const subjectId of selectedIds) {
                await client.query(`
                    INSERT INTO student_subject_enrollments
                        (school_id, student_id, session_id, class_id, programme_id, subject_id)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [schoolId, studentId, sessionId, classId, programmeId, subjectId]);
            }
        }
        await client.query("COMMIT");
        return { assigned_students: studentIds.length, assigned_subjects: selectedIds.length };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { listProgrammes, createProgramme, getProgramme, getProgrammeSubjects, saveProgrammeSubjects, getStudentsForProgrammeAssignment, assignStudents };
