const attendanceService = require("../services/attendanceService");
const asyncHandler = require("../middlewares/asyncHandler");

const getSchoolId = (req) => req.user?.school_id;

const saveAttendance = asyncHandler(async (req,res) => {
    const result=await attendanceService.saveAttendance(req.body,req.user.id,getSchoolId(req));
    res.status(200).json({success:true,message:"Attendance saved successfully.",data:result});
});

const getAttendanceByDate = asyncHandler(async (req,res) => {
    const attendance=await attendanceService.getAttendanceByDate({sessionId:req.query.session_id,termId:req.query.term_id,classId:req.query.class_id,armId:req.query.arm_id||null,attendanceDate:req.query.attendance_date,schoolId:getSchoolId(req)});
    res.json({success:true,data:attendance});
});

const getStudentAttendance = asyncHandler(async (req,res) => {
    const attendance=await attendanceService.getStudentAttendance({studentId:req.params.studentId,sessionId:req.query.session_id,termId:req.query.term_id,schoolId:getSchoolId(req)});
    res.json({success:true,data:attendance});
});

const getAttendanceSummary = asyncHandler(async (req,res) => {
    const summary=await attendanceService.getAttendanceSummary(req.params.studentId,req.query.session_id,req.query.term_id,getSchoolId(req));
    res.json({success:true,data:summary});
});

const getStudentsForAttendance = asyncHandler(async (req,res) => {
    const students=await attendanceService.getStudentsForAttendance({sessionId:req.query.session_id,classId:req.query.class_id,armId:req.query.arm_id||null,schoolId:getSchoolId(req)});
    res.json({success:true,data:students});
});

const getTeacherAttendanceStudents = asyncHandler(async (req,res) => {
    const result=await attendanceService.getStudentsForTeacherAttendance(req.params.assignmentId,req.user.id,getSchoolId(req));
    res.json({success:true,data:result});
});

const getAttendanceByAssignment = asyncHandler(async (req,res) => {
    const attendance=await attendanceService.getAttendanceByAssignment(req.params.assignmentId,req.query.attendance_date,req.user,getSchoolId(req));
    res.json({success:true,data:attendance});
});

module.exports={saveAttendance,getAttendanceByDate,getStudentAttendance,getAttendanceSummary,getStudentsForAttendance,getTeacherAttendanceStudents,getAttendanceByAssignment};