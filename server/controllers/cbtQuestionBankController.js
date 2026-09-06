const model = require("../models/cbtQuestionBankModel");
const { ROLES } = require("../config/roles");

const schoolId = (req) => req.user.school_id;
const sendError = (res, error) => res.status(error.statusCode || 400).json({ success:false, message:error.message || "Unable to process request." });
const validOptions = (options) => Array.isArray(options) && options.length >= 2 && options.every(o => String(o.option_text || "").trim()) && options.filter(o => o.is_correct).length === 1;
const staff = [ROLES.ADMIN,ROLES.TEACHER,ROLES.PRINCIPAL,ROLES.VICE_PRINCIPAL];

exports.list = async (req,res) => { try { return res.json({success:true,data:await model.list(schoolId(req),{subjectId:req.query.subjectId,classId:req.query.classId,active:req.query.active === undefined ? undefined : req.query.active !== "false"})}); } catch(e){return sendError(res,e);} };
exports.get = async (req,res) => { try { const data=await model.getById(Number(req.params.id),schoolId(req)); if(!data)return res.status(404).json({success:false,message:"Question not found."}); return res.json({success:true,data}); } catch(e){return sendError(res,e);} };
exports.create = async (req,res) => { try { if(!validOptions(req.body.options))return res.status(400).json({success:false,message:"Provide at least two non-empty options and exactly one correct option."}); const data=await model.create(req.body,schoolId(req),req.user.id); return res.status(201).json({success:true,message:"Question added to the question bank.",data}); } catch(e){return sendError(res,e);} };
exports.update = async (req,res) => { try { if(!validOptions(req.body.options))return res.status(400).json({success:false,message:"Provide at least two non-empty options and exactly one correct option."}); const data=await model.update(Number(req.params.id),req.body,schoolId(req)); if(!data)return res.status(404).json({success:false,message:"Question not found."}); return res.json({success:true,message:"Question bank item updated.",data}); } catch(e){return sendError(res,e);} };
exports.remove = async (req,res) => { try { const data=await model.remove(Number(req.params.id),schoolId(req)); if(!data)return res.status(404).json({success:false,message:"Question not found."}); return res.json({success:true,message:"Question removed from the question bank."}); } catch(e){return sendError(res,e);} };
exports.copyToExam = async (req,res) => { try { const data=await model.copyToExam(Number(req.params.examId),req.body.bankQuestionIds,schoolId(req)); return res.json({success:true,message:`${data.copied} question(s) added to the examination.`,data}); } catch(e){return sendError(res,e);} };

exports.staffRoles = staff;
