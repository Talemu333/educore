const pool = require("../config/database");

const list = async (schoolId, filters = {}) => {
    const values = [schoolId];
    const where = ["q.school_id=$1"];
    let n = 2;
    if (filters.subjectId) { where.push(`q.subject_id=$${n++}`); values.push(filters.subjectId); }
    if (filters.classId) { where.push(`q.class_id=$${n++}`); values.push(filters.classId); }
    if (filters.active !== undefined) { where.push(`q.is_active=$${n++}`); values.push(filters.active); }
    if (filters.createdById !== undefined && filters.createdById !== null) { where.push(`q.created_by=${n++}`); values.push(filters.createdById); }
    if (filters.assignedTeacherId !== undefined && filters.assignedTeacherId !== null) {
        where.push(`EXISTS (
            SELECT 1
            FROM teacher_assignments ta
            JOIN teachers t ON t.id=ta.teacher_id
            JOIN users assigned_user ON assigned_user.id=t.user_id AND assigned_user.school_id=q.school_id
            WHERE ta.subject_id=q.subject_id
              AND ta.class_id=q.class_id
              AND assigned_user.id=${n++}
        )`);
        values.push(filters.assignedTeacherId);
    }
    const result = await pool.query(`
        SELECT q.*, s.subject_name, c.class_name, u.username AS creator_name,
          COALESCE(json_agg(json_build_object('id',o.id,'option_text',o.option_text,'option_image_url',o.option_image_url,'option_order',o.option_order,'is_correct',o.is_correct) ORDER BY o.option_order) FILTER(WHERE o.id IS NOT NULL),'[]') AS options
        FROM cbt_question_bank q
        JOIN subjects s ON s.id=q.subject_id AND s.school_id=q.school_id
        JOIN classes c ON c.id=q.class_id AND c.school_id=q.school_id
        JOIN users u ON u.id=q.created_by AND u.school_id=q.school_id
        LEFT JOIN cbt_question_bank_options o ON o.bank_question_id=q.id
        WHERE ${where.join(" AND ")}
        GROUP BY q.id,s.subject_name,c.class_name,u.username
        ORDER BY q.created_at DESC,q.id DESC
    `, values);
    return result.rows;
};

const getById = async (id, schoolId, createdById = null, assignedTeacherId = null) => {
    const result = await pool.query(`
        SELECT q.*, s.subject_name, c.class_name,
          COALESCE(json_agg(json_build_object('id',o.id,'option_text',o.option_text,'option_image_url',o.option_image_url,'option_order',o.option_order,'is_correct',o.is_correct) ORDER BY o.option_order) FILTER(WHERE o.id IS NOT NULL),'[]') AS options
        FROM cbt_question_bank q
        JOIN subjects s ON s.id=q.subject_id AND s.school_id=q.school_id
        JOIN classes c ON c.id=q.class_id AND c.school_id=q.school_id
        LEFT JOIN cbt_question_bank_options o ON o.bank_question_id=q.id
        WHERE q.id=$1 AND q.school_id=$2
          AND ($3::integer IS NULL OR q.created_by=$3)
          AND ($4::integer IS NULL OR EXISTS (
              SELECT 1
              FROM teacher_assignments ta
              JOIN teachers t ON t.id=ta.teacher_id
              JOIN users assigned_user ON assigned_user.id=t.user_id AND assigned_user.school_id=q.school_id
              WHERE ta.subject_id=q.subject_id
                AND ta.class_id=q.class_id
                AND assigned_user.id=$4
          ))
        GROUP BY q.id,s.subject_name,c.class_name
    `, [id, schoolId, createdById, assignedTeacherId]);
    return result.rows[0];
};

const create = async (data, schoolId, userId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const q = await client.query(`INSERT INTO cbt_question_bank(school_id,subject_id,class_id,question_text,image_url,marks,explanation,is_active,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [schoolId,data.subject_id,data.class_id,data.question_text,data.image_url||null,data.marks||1,data.explanation||null,data.is_active!==false,userId]);
        for (const o of data.options || []) await client.query(`INSERT INTO cbt_question_bank_options(bank_question_id,option_text,option_image_url,option_order,is_correct) VALUES($1,$2,$3,$4,$5)`, [q.rows[0].id,o.option_text,o.option_image_url||null,o.option_order,Boolean(o.is_correct)]);
        await client.query("COMMIT");
        return getById(q.rows[0].id, schoolId);
    } catch (e) { await client.query("ROLLBACK"); throw e; } finally { client.release(); }
};

const bulkCreate = async (questions, schoolId, userId) => {
    const client = await pool.connect();
    const createdIds = [];
    try {
        await client.query("BEGIN");
        const subjectIds = [...new Set(questions.map((q) => Number(q.subject_id)))];
        const classIds = [...new Set(questions.map((q) => Number(q.class_id)))];
        const subjects = await client.query("SELECT id FROM subjects WHERE school_id=$1 AND id=ANY($2::int[])", [schoolId, subjectIds]);
        const classes = await client.query("SELECT id FROM classes WHERE school_id=$1 AND id=ANY($2::int[])", [schoolId, classIds]);
        if (subjects.rows.length !== subjectIds.length || classes.rows.length !== classIds.length) throw new Error("The selected subject or class does not belong to your school.");

        for (const data of questions) {
            const q = await client.query(`INSERT INTO cbt_question_bank(school_id,subject_id,class_id,question_text,image_url,marks,explanation,is_active,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`, [schoolId,data.subject_id,data.class_id,data.question_text,data.image_url||null,data.marks||1,data.explanation||null,data.is_active!==false,userId]);
            const questionId = q.rows[0].id;
            createdIds.push(questionId);
            for (const o of data.options || []) await client.query(`INSERT INTO cbt_question_bank_options(bank_question_id,option_text,option_image_url,option_order,is_correct) VALUES($1,$2,$3,$4,$5)`, [questionId,o.option_text,o.option_image_url||null,o.option_order,Boolean(o.is_correct)]);
        }
        await client.query("COMMIT");
        const result = await pool.query(`
            SELECT q.*, s.subject_name, c.class_name,
              COALESCE(json_agg(json_build_object('id',o.id,'option_text',o.option_text,'option_image_url',o.option_image_url,'option_order',o.option_order,'is_correct',o.is_correct) ORDER BY o.option_order) FILTER(WHERE o.id IS NOT NULL),'[]') AS options
            FROM cbt_question_bank q
            JOIN subjects s ON s.id=q.subject_id AND s.school_id=q.school_id
            JOIN classes c ON c.id=q.class_id AND c.school_id=q.school_id
            LEFT JOIN cbt_question_bank_options o ON o.bank_question_id=q.id
            WHERE q.school_id=$1 AND q.id=ANY($2::int[])
            GROUP BY q.id,s.subject_name,c.class_name
            ORDER BY array_position($2::int[],q.id)
        `, [schoolId, createdIds]);
        return result.rows;
    } catch (e) { await client.query("ROLLBACK"); throw e; } finally { client.release(); }
};

const update = async (id, data, schoolId, createdById = null) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const ownerClause = createdById === null ? "" : " AND created_by=$10";
        const values = [id,schoolId,data.subject_id,data.class_id,data.question_text,data.image_url||null,data.marks||1,data.explanation||null,data.is_active!==false];
        if (createdById !== null) values.push(createdById);
        const q = await client.query(`UPDATE cbt_question_bank SET subject_id=$3,class_id=$4,question_text=$5,image_url=$6,marks=$7,explanation=$8,is_active=$9,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND school_id=$2${ownerClause} RETURNING *`, values);
        if (!q.rows[0]) { await client.query("ROLLBACK"); return null; }
        if (Array.isArray(data.options)) {
            await client.query("DELETE FROM cbt_question_bank_options WHERE bank_question_id=$1", [id]);
            for (const o of data.options) await client.query(`INSERT INTO cbt_question_bank_options(bank_question_id,option_text,option_image_url,option_order,is_correct) VALUES($1,$2,$3,$4,$5)`, [id,o.option_text,o.option_image_url||null,o.option_order,Boolean(o.is_correct)]);
        }
        await client.query("COMMIT");
        return getById(id, schoolId, createdById);
    } catch (e) { await client.query("ROLLBACK"); throw e; } finally { client.release(); }
};

const remove = async (id, schoolId, createdById = null) => {
    const ownerClause = createdById === null ? "" : " AND created_by=$3";
    const values = createdById === null ? [id, schoolId] : [id, schoolId, createdById];
    const result = await pool.query(`DELETE FROM cbt_question_bank WHERE id=$1 AND school_id=$2${ownerClause} RETURNING id`, values);
    return result.rows[0];
};

const bulkRemove = async (ids, schoolId, createdById = null) => {
    const requested = [...new Set((Array.isArray(ids) ? ids : []).map(Number).filter((id) => Number.isInteger(id) && id > 0))];
    if (!requested.length) throw new Error("Select at least one valid question.");
    if (requested.length > 500) throw new Error("You can delete at most 500 questions at a time.");

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const values = [requested, schoolId];
        const ownerClause = createdById === null ? "" : " AND created_by=$3";
        if (createdById !== null) values.push(createdById);
        const result = await client.query(
            `DELETE FROM cbt_question_bank WHERE id=ANY($1::int[]) AND school_id=$2${ownerClause} RETURNING id`,
            values
        );
        if (result.rows.length !== requested.length) {
            throw new Error("Some selected questions could not be deleted. They may not belong to your school or you may not have permission to delete them. No questions were deleted.");
        }
        await client.query("COMMIT");
        return { deleted: result.rows.length };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const copyToExam = async (examId, bankIds, schoolId, createdById = null, assignedTeacherId = null) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const examResult = await client.query(
            "SELECT id, subject_id, class_id FROM cbt_exams WHERE id=$1 AND school_id=$2 FOR UPDATE",
            [examId, schoolId]
        );
        const exam = examResult.rows[0];
        if (!exam) throw new Error("Examination not found.");

        const attempts = await client.query(
            "SELECT COUNT(*)::int AS count FROM cbt_attempts WHERE exam_id=$1 AND school_id=$2",
            [examId, schoolId]
        );
        if (Number(attempts.rows[0]?.count || 0) > 0) {
            throw new Error("Questions cannot be added because students have already started an attempt for this examination.");
        }

        const requested = [...new Set((bankIds || []).map(Number).filter(Number.isInteger))];
        if (!requested.length) throw new Error("Select at least one question.");

        const selected = await client.query(`
            SELECT q.*,
                COALESCE(json_agg(json_build_object(
                    'id',o.id,'option_text',o.option_text,
                    'option_image_url',o.option_image_url,
                    'option_order',o.option_order,'is_correct',o.is_correct
                ) ORDER BY o.option_order) FILTER (WHERE o.id IS NOT NULL), '[]') AS options
            FROM cbt_question_bank q
            JOIN cbt_exam_subjects es
              ON es.exam_id=$3 AND es.school_id=q.school_id
             AND es.subject_id=q.subject_id
            LEFT JOIN cbt_question_bank_options o ON o.bank_question_id=q.id
            WHERE q.id=ANY($1::int[])
              AND q.school_id=$2
              AND q.is_active=true
              AND q.class_id=$4
              AND ($6::integer IS NULL OR EXISTS (
                  SELECT 1
                  FROM teacher_assignments ta
                  JOIN teachers t ON t.id=ta.teacher_id
                  JOIN users u ON u.id=t.user_id AND u.school_id=q.school_id
                  WHERE ta.subject_id=q.subject_id AND ta.class_id=$4
                    AND (ta.arm_id IS NULL OR EXISTS (
                        SELECT 1 FROM cbt_exams target_exam
                        WHERE target_exam.id=$3 AND target_exam.school_id=q.school_id
                          AND (target_exam.arm_id IS NULL OR target_exam.arm_id=ta.arm_id)
                    ))
                    AND u.id=$6
              ))
            GROUP BY q.id
            ORDER BY array_position($1::int[],q.id)
        `, [requested, schoolId, examId, exam.class_id, createdById, assignedTeacherId]);

        if (selected.rows.length !== requested.length) {
            throw new Error("Some selected questions do not belong to this school's question bank, selected examination subjects, or examination class.");
        }

        const maxOrder = await client.query(
            "SELECT COALESCE(MAX(question_order),0)::int AS max_order FROM cbt_questions WHERE exam_id=$1 AND school_id=$2",
            [examId, schoolId]
        );
        let order = Number(maxOrder.rows[0].max_order || 0);

        for (const q of selected.rows) {
            order += 1;
            const created = await client.query(`
                INSERT INTO cbt_questions
                    (school_id,exam_id,subject_id,question_text,image_url,marks,question_order,explanation)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                RETURNING id
            `, [schoolId, examId, q.subject_id, q.question_text, q.image_url, q.marks, order, q.explanation]);

            for (const option of q.options) {
                await client.query(`
                    INSERT INTO cbt_question_options
                        (question_id,option_text,option_image_url,option_order,is_correct)
                    VALUES ($1,$2,$3,$4,$5)
                `, [created.rows[0].id, option.option_text, option.option_image_url, option.option_order, option.is_correct]);
            }
        }

        const totals = await client.query(
            "SELECT COALESCE(SUM(marks),0)::numeric AS total_marks FROM cbt_questions WHERE exam_id=$1 AND school_id=$2",
            [examId, schoolId]
        );
        await client.query(
            "UPDATE cbt_exams SET total_marks=$3,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND school_id=$2",
            [examId, schoolId, Number(totals.rows[0].total_marks || 0)]
        );

        await client.query("COMMIT");
        return { copied: selected.rows.length, total_marks: Number(totals.rows[0].total_marks || 0) };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { list, getById, create, bulkCreate, update, remove, bulkRemove, copyToExam };
