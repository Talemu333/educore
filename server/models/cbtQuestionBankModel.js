const pool = require("../config/database");

const list = async (schoolId, filters = {}) => {
    const values = [schoolId];
    const where = ["q.school_id=$1"];
    let n = 2;
    if (filters.subjectId) { where.push(`q.subject_id=$${n++}`); values.push(filters.subjectId); }
    if (filters.classId) { where.push(`q.class_id=$${n++}`); values.push(filters.classId); }
    if (filters.active !== undefined) { where.push(`q.is_active=$${n++}`); values.push(filters.active); }
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

const getById = async (id, schoolId) => {
    const result = await pool.query(`
        SELECT q.*, s.subject_name, c.class_name,
          COALESCE(json_agg(json_build_object('id',o.id,'option_text',o.option_text,'option_image_url',o.option_image_url,'option_order',o.option_order,'is_correct',o.is_correct) ORDER BY o.option_order) FILTER(WHERE o.id IS NOT NULL),'[]') AS options
        FROM cbt_question_bank q
        JOIN subjects s ON s.id=q.subject_id AND s.school_id=q.school_id
        JOIN classes c ON c.id=q.class_id AND c.school_id=q.school_id
        LEFT JOIN cbt_question_bank_options o ON o.bank_question_id=q.id
        WHERE q.id=$1 AND q.school_id=$2
        GROUP BY q.id,s.subject_name,c.class_name
    `, [id, schoolId]);
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

const update = async (id, data, schoolId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const q = await client.query(`UPDATE cbt_question_bank SET subject_id=$3,class_id=$4,question_text=$5,image_url=$6,marks=$7,explanation=$8,is_active=$9,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND school_id=$2 RETURNING *`, [id,schoolId,data.subject_id,data.class_id,data.question_text,data.image_url||null,data.marks||1,data.explanation||null,data.is_active!==false]);
        if (!q.rows[0]) { await client.query("ROLLBACK"); return null; }
        if (Array.isArray(data.options)) {
            await client.query("DELETE FROM cbt_question_bank_options WHERE bank_question_id=$1", [id]);
            for (const o of data.options) await client.query(`INSERT INTO cbt_question_bank_options(bank_question_id,option_text,option_image_url,option_order,is_correct) VALUES($1,$2,$3,$4,$5)`, [id,o.option_text,o.option_image_url||null,o.option_order,Boolean(o.is_correct)]);
        }
        await client.query("COMMIT");
        return getById(id, schoolId);
    } catch (e) { await client.query("ROLLBACK"); throw e; } finally { client.release(); }
};

const remove = async (id, schoolId) => {
    const result = await pool.query("DELETE FROM cbt_question_bank WHERE id=$1 AND school_id=$2 RETURNING id", [id,schoolId]);
    return result.rows[0];
};

const copyToExam = async (examId, bankIds, schoolId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const exam = await client.query("SELECT id,subject_id,class_id FROM cbt_exams WHERE id=$1 AND school_id=$2 FOR UPDATE", [examId,schoolId]);
        if (!exam.rows[0]) throw new Error("Examination not found.");
        const requested = [...new Set((bankIds || []).map(Number).filter(Number.isInteger))];
        if (!requested.length) throw new Error("Select at least one question.");
        const selected = await client.query(`SELECT q.*,COALESCE(json_agg(json_build_object('id',o.id,'option_text',o.option_text,'option_image_url',o.option_image_url,'option_order',o.option_order,'is_correct',o.is_correct) ORDER BY o.option_order) FILTER(WHERE o.id IS NOT NULL),'[]') AS options FROM cbt_question_bank q LEFT JOIN cbt_question_bank_options o ON o.bank_question_id=q.id WHERE q.id=ANY($1::int[]) AND q.school_id=$2 AND q.is_active=true AND q.subject_id=$3 AND q.class_id=$4 GROUP BY q.id ORDER BY array_position($1::int[],q.id)`, [requested,schoolId,exam.rows[0].subject_id,exam.rows[0].class_id]);
        if (selected.rows.length !== requested.length) throw new Error("Some selected questions do not belong to this examination's school, subject, or class.");
        const maxOrder = await client.query("SELECT COALESCE(MAX(question_order),0)::int AS max_order FROM cbt_questions WHERE exam_id=$1 AND school_id=$2", [examId,schoolId]);
        let order = maxOrder.rows[0].max_order;
        for (const q of selected.rows) {
            order += 1;
            const created = await client.query(`INSERT INTO cbt_questions(school_id,exam_id,question_text,image_url,marks,question_order,explanation) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`, [schoolId,examId,q.question_text,q.image_url,q.marks,order,q.explanation]);
            for (const o of q.options) await client.query(`INSERT INTO cbt_question_options(question_id,option_text,option_image_url,option_order,is_correct) VALUES($1,$2,$3,$4,$5)`, [created.rows[0].id,o.option_text,o.option_image_url,o.option_order,o.is_correct]);
        }
        const totals = await client.query("SELECT COALESCE(SUM(marks),0)::numeric AS total_marks FROM cbt_questions WHERE exam_id=$1 AND school_id=$2", [examId,schoolId]);
        await client.query("UPDATE cbt_exams SET total_marks=$3,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND school_id=$2", [examId,schoolId,Number(totals.rows[0].total_marks||0)]);
        await client.query("COMMIT");
        return { copied: selected.rows.length, total_marks: Number(totals.rows[0].total_marks||0) };
    } catch (e) { await client.query("ROLLBACK"); throw e; } finally { client.release(); }
};

module.exports = { list, getById, create, update, remove, copyToExam };
