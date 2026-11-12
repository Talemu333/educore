const pool = require("../config/database");

const list = async (schoolId, filters = {}) => {
    const values = [schoolId];
    const where = ["g.school_id=$1"];
    let n = 2;
    if (filters.subjectId) { where.push(`g.subject_id=$${n++}`); values.push(filters.subjectId); }
    if (filters.classId) { where.push(`g.class_id=$${n++}`); values.push(filters.classId); }
    if (filters.assignedTeacherId) {
        where.push(`EXISTS (SELECT 1 FROM teacher_assignments ta JOIN teachers t ON t.id=ta.teacher_id JOIN users u ON u.id=t.user_id AND u.school_id=g.school_id WHERE ta.subject_id=g.subject_id AND ta.class_id=g.class_id AND u.id=$${n++})`);
        values.push(filters.assignedTeacherId);
    }
    const result = await pool.query(`
        SELECT g.*, s.subject_name, c.class_name, u.username AS creator_name,
          COUNT(q.id)::int AS question_count,
          COALESCE(json_agg(json_build_object('id',q.id,'question_text',q.question_text) ORDER BY q.id)
            FILTER (WHERE q.id IS NOT NULL), '[]') AS questions
        FROM cbt_question_groups g
        JOIN subjects s ON s.id=g.subject_id AND s.school_id=g.school_id
        JOIN classes c ON c.id=g.class_id AND c.school_id=g.school_id
        JOIN users u ON u.id=g.created_by AND u.school_id=g.school_id
        LEFT JOIN cbt_question_bank q ON q.question_group_id=g.id AND q.school_id=g.school_id
        WHERE ${where.join(" AND ")}
        GROUP BY g.id,s.subject_name,c.class_name,u.username
        ORDER BY g.created_at DESC,g.id DESC
    `, values);
    return result.rows;
};

const createFromBank = async (data, schoolId, userId) => {
    const ids = [...new Set((data.question_ids || []).map(Number).filter(id => Number.isInteger(id) && id > 0))];
    if (!ids.length) throw new Error("Select at least one question to place in this group.");
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const selected = await client.query(
            `SELECT id,subject_id,class_id,question_group_id FROM cbt_question_bank
             WHERE school_id=$1 AND id=ANY($2::int[]) FOR UPDATE`,
            [schoolId, ids]
        );
        if (selected.rows.length !== ids.length) throw new Error("Some selected questions do not belong to this school's question bank.");
        const first = selected.rows[0];
        if (selected.rows.some(q => Number(q.subject_id)!==Number(first.subject_id) || Number(q.class_id)!==Number(first.class_id) || q.question_group_id)) {
            throw new Error("Selected questions must belong to the same subject and class and must not already belong to another group.");
        }
        if (data.subject_id && Number(data.subject_id)!==Number(first.subject_id)) throw new Error("The group subject must match the selected questions.");
        if (data.class_id && Number(data.class_id)!==Number(first.class_id)) throw new Error("The group class must match the selected questions.");
        const group = await client.query(
            `INSERT INTO cbt_question_groups
             (school_id,subject_id,class_id,title,material_type,instructions,material_text,image_url,created_by)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [schoolId,first.subject_id,first.class_id,String(data.title||"").trim(),data.material_type,
             data.instructions||null,data.material_text||null,data.image_url||null,userId]
        );
        await client.query(
            "UPDATE cbt_question_bank SET question_group_id=$1,updated_at=CURRENT_TIMESTAMP WHERE school_id=$2 AND id=ANY($3::int[])",
            [group.rows[0].id,schoolId,ids]
        );
        await client.query(
            "UPDATE cbt_questions SET question_group_id=$1 WHERE school_id=$2 AND question_bank_id=ANY($3::int[])",
            [group.rows[0].id,schoolId,ids]
        );
        await client.query("COMMIT");
        return { ...group.rows[0], question_count: ids.length };
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
};


const updateGroup = async (id, schoolId, data) => {
    const result = await pool.query(
        `UPDATE cbt_question_groups
         SET title=$3, material_type=$4, instructions=$5, material_text=$6,
             image_url=$7, updated_at=CURRENT_TIMESTAMP
         WHERE id=$1 AND school_id=$2
         RETURNING *`,
        [id, schoolId, data.title, data.material_type, data.instructions || null,
         data.material_text || null, data.image_url || null]
    );
    return result.rows[0] || null;
};


const addQuestions = async (groupId, schoolId, questionIds) => {
    const ids=[...new Set((questionIds||[]).map(Number).filter(id=>Number.isInteger(id)&&id>0))];
    if(!ids.length) throw new Error("Select at least one question to add.");
    const client=await pool.connect();
    try {
        await client.query("BEGIN");
        const groupResult=await client.query(
            "SELECT id,subject_id,class_id FROM cbt_question_groups WHERE id=$1 AND school_id=$2 FOR UPDATE",
            [groupId,schoolId]
        );
        if(!groupResult.rows[0]) throw new Error("Question group not found.");
        const group=groupResult.rows[0];
        const selected=await client.query(
            "SELECT id,subject_id,class_id,question_group_id FROM cbt_question_bank WHERE school_id=$1 AND id=ANY($2::int[]) FOR UPDATE",
            [schoolId,ids]
        );
        if(selected.rows.length!==ids.length) throw new Error("Some selected questions do not belong to this school's question bank.");
        if(selected.rows.some(q=>Number(q.subject_id)!==Number(group.subject_id)||Number(q.class_id)!==Number(group.class_id)||q.question_group_id)) {
            throw new Error("Questions must match the group's subject and class and must not already belong to another group.");
        }
        await client.query(
            "UPDATE cbt_question_bank SET question_group_id=$1,updated_at=CURRENT_TIMESTAMP WHERE school_id=$2 AND id=ANY($3::int[])",
            [groupId,schoolId,ids]
        );
        await client.query(
            "UPDATE cbt_questions SET question_group_id=$1 WHERE school_id=$2 AND question_bank_id=ANY($3::int[])",
            [groupId,schoolId,ids]
        );
        await client.query("COMMIT");
        return { added: ids.length };
    } catch(error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
};

const deleteGroup = async (groupId, schoolId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const group = await client.query("SELECT id FROM cbt_question_groups WHERE id=$1 AND school_id=$2 FOR UPDATE", [groupId, schoolId]);
        if (!group.rows.length) throw new Error("Question group not found.");
        await client.query("UPDATE cbt_question_bank SET question_group_id=NULL,updated_at=CURRENT_TIMESTAMP WHERE school_id=$1 AND question_group_id=$2", [schoolId, groupId]);
        await client.query("UPDATE cbt_questions SET question_group_id=NULL WHERE school_id=$1 AND question_group_id=$2", [schoolId, groupId]);
        await client.query("DELETE FROM cbt_question_groups WHERE id=$1 AND school_id=$2", [groupId, schoolId]);
        await client.query("COMMIT");
        return { deleted: true };
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
};

const removeQuestion = async (groupId, questionId, schoolId) => {
    const client=await pool.connect();
    try {
        await client.query("BEGIN");
        const result=await client.query(
            "UPDATE cbt_question_bank SET question_group_id=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND school_id=$2 AND question_group_id=$3 RETURNING id",
            [questionId,schoolId,groupId]
        );
        if(!result.rows.length) throw new Error("Question is not a member of this group.");
        await client.query(
            "UPDATE cbt_questions SET question_group_id=NULL WHERE school_id=$1 AND question_bank_id=$2 AND question_group_id=$3",
            [schoolId,questionId,groupId]
        );
        await client.query("COMMIT");
        return { removed: 1 };
    } catch(error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
};

module.exports = { list, createFromBank, updateGroup, addQuestions, removeQuestion, deleteGroup };

