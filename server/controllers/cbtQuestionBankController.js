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
exports.copyToExam = async (req,res) => { try { const role=String(req.user?.role_name||"").trim().toLowerCase(); const assignedTeacherId=role==="teacher"?Number(req.user.id):null; const data=await model.copyToExam(Number(req.params.examId),req.body.bankQuestionIds,schoolId(req),null,assignedTeacherId); return res.json({success:true,message:`${data.copied} question(s) added to the examination.`,data}); } catch(e){return sendError(res,e);} };
