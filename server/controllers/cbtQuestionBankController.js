const model = require("../models/cbtQuestionBankModel");

const schoolId = (req) => req.user.school_id;
const ownerId = (req) => ["admin", "administrator"].includes(String(req.user?.role_name || "").trim().toLowerCase()) ? null : Number(req.user.id);
const sendError = (res, error) => res.status(error.statusCode || 400).json({ success:false, message:error.message || "Unable to process request." });

// Match the frontend: an option may contain text, an image, or both.
const normalizeOptions = (options) => Array.isArray(options)
    ? options
        .map((option, index) => ({
            ...option,
            option_text: String(option.option_text || "").trim(),
            option_image_url: String(option.option_image_url || "").trim(),
            option_order: index + 1,
            is_correct: Boolean(option.is_correct),
        }))
        .filter((option) => option.option_text || option.option_image_url)
    : [];

const validOptions = (options) =>
    options.length >= 2 && options.filter((option) => option.is_correct).length === 1;

const assignedTeacherId = (req) => String(req.user?.role_name || "").trim().toLowerCase() === "teacher" ? Number(req.user.id) : null;
exports.list = async (req,res) => { try { return res.json({success:true,data:await model.list(schoolId(req),{subjectId:req.query.subjectId,classId:req.query.classId,active:req.query.active === undefined ? undefined : req.query.active !== "false",assignedTeacherId:assignedTeacherId(req)})}); } catch(e){return sendError(res,e);} };
exports.get = async (req,res) => { try { const data=await model.getById(Number(req.params.id),schoolId(req),null,assignedTeacherId(req)); if(!data)return res.status(404).json({success:false,message:"Question not found."}); return res.json({success:true,data}); } catch(e){return sendError(res,e);} };
exports.create = async (req,res) => {
    try {
        const options = normalizeOptions(req.body.options);
        if (!validOptions(options)) return res.status(400).json({success:false,message:"Provide at least two options containing text or an image, and mark exactly one as correct."});
        const data = await model.create({ ...req.body, options },schoolId(req),req.user.id);
        return res.status(201).json({success:true,message:"Question added to the question bank.",data});
    } catch(e){return sendError(res,e);}
};
exports.update = async (req,res) => {
    try {
        const options = normalizeOptions(req.body.options);
        if (!validOptions(options)) return res.status(400).json({success:false,message:"Provide at least two options containing text or an image, and mark exactly one as correct."});
        const data = await model.update(Number(req.params.id),{ ...req.body, options },schoolId(req),ownerId(req));
        if(!data)return res.status(404).json({success:false,message:"Question not found."});
        return res.json({success:true,message:"Question bank item updated.",data});
    } catch(e){return sendError(res,e);}
};
exports.remove = async (req,res) => { try { const data=await model.remove(Number(req.params.id),schoolId(req),ownerId(req)); if(!data)return res.status(404).json({success:false,message:"Question not found."}); return res.json({success:true,message:"Question removed from the question bank."}); } catch(e){return sendError(res,e);} };
exports.bulkRemove = async (req,res) => {
    try {
        if (!Array.isArray(req.body?.ids) || !req.body.ids.length) return res.status(400).json({success:false,message:"Select at least one question to delete."});
        if (req.body.ids.length > 500) return res.status(400).json({success:false,message:"You can delete at most 500 questions at a time."});
        const data = await model.bulkRemove(req.body.ids,schoolId(req),ownerId(req));
        return res.json({success:true,message:`${data.deleted} question(s) removed from the question bank.`,data});
    } catch(e){return sendError(res,e);}
};
exports.copyToExam = async (req,res) => { try { const role=String(req.user?.role_name||"").trim().toLowerCase(); const assignedTeacherId=role==="teacher"?Number(req.user.id):null; const data=await model.copyToExam(Number(req.params.examId),req.body.bankQuestionIds,schoolId(req),assignedTeacherId); return res.json({success:true,message:`${data.copied} question(s) added to the examination.`,data}); } catch(e){return sendError(res,e);} };


exports.listGroups = async (req,res) => {
    try {
        const role=String(req.user?.role_name||"").trim().toLowerCase();
        const assignedTeacherId=role==="teacher"?Number(req.user.id):null;
        const data=await require("../models/cbtQuestionGroupModel").list(schoolId(req),{
            subjectId:req.query.subjectId,classId:req.query.classId,assignedTeacherId
        });
        return res.json({success:true,data});
    } catch(e){return sendError(res,e);}
};

exports.createGroup = async (req,res) => {
    try {
        const title=String(req.body?.title||"").trim();
        const materialType=String(req.body?.material_type||"").trim().toLowerCase();
        const allowedTypes=["passage","instruction","diagram","image","table","graph","mixed"];
        if(!title)return res.status(400).json({success:false,message:"A group title is required."});
        if(!allowedTypes.includes(materialType))return res.status(400).json({success:false,message:"Choose a valid shared-material type."});
        if(!String(req.body?.material_text||"").trim()&&!String(req.body?.image_url||"").trim())return res.status(400).json({success:false,message:"Provide shared text or an image URL."});
        const ids=[...new Set((Array.isArray(req.body?.question_ids)?req.body.question_ids:[]).map(Number).filter(id=>Number.isInteger(id)&&id>0))];
        if(!ids.length)return res.status(400).json({success:false,message:"Select at least one question."});
        const role=String(req.user?.role_name||"").trim().toLowerCase();
        const fullManager=["admin","administrator","proprietor","principal","vice_principal"].includes(role);
        if(!fullManager){
            if(role!=="teacher")return res.status(403).json({success:false,message:"You are not authorised to create question groups."});
            const db=require("../config/database");
            const access=await db.query(`
                SELECT COUNT(DISTINCT q.id)::int AS total
                FROM cbt_question_bank q
                JOIN teacher_assignments ta ON ta.subject_id=q.subject_id AND ta.class_id=q.class_id
                JOIN teachers t ON t.id=ta.teacher_id
                JOIN users u ON u.id=t.user_id AND u.school_id=q.school_id
                WHERE q.school_id=$1 AND q.id=ANY($2::int[]) AND u.id=$3
            `,[schoolId(req),ids,Number(req.user.id)]);
            if(Number(access.rows[0]?.total||0)!==ids.length)return res.status(403).json({success:false,message:"You can only group questions in subjects and classes assigned to you."});
        }
        const data=await require("../models/cbtQuestionGroupModel").createFromBank({
            ...req.body,title,material_type:materialType,question_ids:ids
        },schoolId(req),Number(req.user.id));
        return res.status(201).json({success:true,message:"Shared material group created and linked to the selected questions.",data});
    } catch(e){return sendError(res,e);}
};


exports.updateGroup = async (req,res) => {
    try {
        const id=Number(req.params.groupId);
        const title=String(req.body?.title||"").trim();
        const materialType=String(req.body?.material_type||"").trim().toLowerCase();
        const allowedTypes=["passage","instruction","diagram","image","table","graph","mixed"];
        const materialText=String(req.body?.material_text||"").trim();
        const imageUrl=String(req.body?.image_url||"").trim();
        if(!Number.isInteger(id)||id<1)return res.status(400).json({success:false,message:"Invalid question group."});
        if(!title)return res.status(400).json({success:false,message:"A group title is required."});
        if(!allowedTypes.includes(materialType))return res.status(400).json({success:false,message:"Choose a valid shared-material type."});
        if(!materialText&&!imageUrl)return res.status(400).json({success:false,message:"Provide shared text or an image URL."});
        const role=String(req.user?.role_name||"").trim().toLowerCase();
        const manager=["admin","administrator","proprietor","principal","vice_principal"].includes(role);
        if(!manager){
            if(role!=="teacher")return res.status(403).json({success:false,message:"You are not authorised to edit question groups."});
            const db=require("../config/database");
            const access=await db.query(`
                SELECT 1 FROM cbt_question_groups g
                JOIN teacher_assignments ta ON ta.subject_id=g.subject_id AND ta.class_id=g.class_id
                JOIN teachers t ON t.id=ta.teacher_id
                JOIN users u ON u.id=t.user_id AND u.school_id=g.school_id
                WHERE g.id=$1 AND g.school_id=$2 AND u.id=$3 LIMIT 1
            `,[id,schoolId(req),Number(req.user.id)]);
            if(!access.rows.length)return res.status(403).json({success:false,message:"You can only edit shared materials for subjects and classes assigned to you."});
        }
        const data=await require("../models/cbtQuestionGroupModel").updateGroup(id,schoolId(req),{
            title,material_type:materialType,instructions:String(req.body?.instructions||"").trim(),
            material_text:materialText,image_url:imageUrl
        });
        if(!data)return res.status(404).json({success:false,message:"Question group not found."});
        return res.json({success:true,message:"Shared material updated.",data});
    } catch(e){return sendError(res,e);}
};


const canManageQuestionGroup = async (req, groupId) => {
    const role=String(req.user?.role_name||"").trim().toLowerCase();
    if(["admin","administrator","proprietor","principal","vice_principal"].includes(role)) return true;
    if(role!=="teacher") return false;
    const db=require("../config/database");
    const access=await db.query(`
        SELECT 1
        FROM cbt_question_groups g
        JOIN teacher_assignments ta ON ta.subject_id=g.subject_id AND ta.class_id=g.class_id
        JOIN teachers t ON t.id=ta.teacher_id
        JOIN users u ON u.id=t.user_id AND u.school_id=g.school_id
        WHERE g.id=$1 AND g.school_id=$2 AND u.id=$3
        LIMIT 1
    `,[groupId,schoolId(req),Number(req.user.id)]);
    return access.rows.length>0;
};

exports.addQuestionsToGroup = async (req,res) => {
    try {
        const groupId=Number(req.params.groupId);
        const ids=[...new Set((Array.isArray(req.body?.question_ids)?req.body.question_ids:[]).map(Number).filter(id=>Number.isInteger(id)&&id>0))];
        if(!Number.isInteger(groupId)||groupId<1)return res.status(400).json({success:false,message:"Invalid question group."});
        if(!ids.length)return res.status(400).json({success:false,message:"Select at least one question."});
        if(ids.length>500)return res.status(400).json({success:false,message:"You can add at most 500 questions at a time."});
        if(!await canManageQuestionGroup(req,groupId))return res.status(403).json({success:false,message:"You are not authorised to manage this question group."});
        const data=await require("../models/cbtQuestionGroupModel").addQuestions(groupId,schoolId(req),ids);
        return res.json({success:true,message:`${data.added} question(s) added to the shared-material group.`,data});
    } catch(e){return sendError(res,e);}
};

exports.removeQuestionFromGroup = async (req,res) => {
    try {
        const groupId=Number(req.params.groupId), questionId=Number(req.params.questionId);
        if(!Number.isInteger(groupId)||groupId<1||!Number.isInteger(questionId)||questionId<1)
            return res.status(400).json({success:false,message:"Invalid question group or question."});
        if(!await canManageQuestionGroup(req,groupId))return res.status(403).json({success:false,message:"You are not authorised to manage this question group."});
        const data=await require("../models/cbtQuestionGroupModel").removeQuestion(groupId,questionId,schoolId(req));
        return res.json({success:true,message:"Question removed from the shared-material group. The question itself has been kept.",data});
    } catch(e){return sendError(res,e);}
};
