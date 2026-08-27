const studentResultService = require("../services/studentResultService");
const asyncHandler = require("../middlewares/asyncHandler");
const getSchoolId = req => req.user?.school_id;

const createResult = asyncHandler(async (req,res)=>{const result=await studentResultService.createResult(req.body,getSchoolId(req));res.status(201).json({success:true,message:"Result created successfully.",data:result});});
const createBulkResults = asyncHandler(async (req,res)=>{await studentResultService.createBulkResults(req.body,getSchoolId(req));res.status(201).json({success:true,message:"Results uploaded successfully."});});
const getStudentsForAssignment = asyncHandler(async (req,res)=>{const data=await studentResultService.getStudentsForAssignment(req.params.assignmentId,getSchoolId(req));res.json({success:true,data});});
const getStudentsForResultEntry = asyncHandler(async (req,res)=>{const data=await studentResultService.getStudentsForResultEntry(req.params.assignmentId,getSchoolId(req));res.json({success:true,data});});
const getStudentResultReport = asyncHandler(async (req,res)=>{const data=await studentResultService.getStudentResultReport(req.params.studentId,req.params.sessionId,req.params.termId,getSchoolId(req));res.json({success:true,data});});
const getClassResultSheet = asyncHandler(async (req,res)=>{const {classId,armId,sessionId,termId}=req.query;const data=await studentResultService.getClassResultSheet(Number(classId),armId?Number(armId):null,Number(sessionId),Number(termId),getSchoolId(req));res.json({success:true,data});});
const getClassBroadsheet = asyncHandler(async (req,res)=>{const {classId,armId,sessionId,termId}=req.query;const data=await studentResultService.getClassBroadsheet(Number(classId),armId?Number(armId):null,Number(sessionId),Number(termId),getSchoolId(req));res.json({success:true,data});});
module.exports={createResult,createBulkResults,getStudentsForAssignment,getStudentsForResultEntry,getStudentResultReport,getClassResultSheet,getClassBroadsheet};