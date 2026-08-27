const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
const attendanceModel = require("../models/attendanceModel");
const studentModel = require("../models/studentModel");
const sessionModel = require("../models/sessionModel");
const termModel = require("../models/termModel");
const classModel = require("../models/classModel");
const studentEnrollmentModel = require("../models/studentEnrollmentModel");
const teacherAssignmentService = require("./teacherAssignmentService");

const validateContext = async (data, schoolId) => {
    if (!schoolId) throw new ApiError(403,"School context is required.");
    const session = await sessionModel.getSessionById(data.session_id, schoolId);
    if (!session) throw new ApiError(404,"Academic session not found.");
    const term = await termModel.getTermById(data.term_id, schoolId);
    if (!term) throw new ApiError(404,"Term not found.");
    if (Number(term.session_id) !== Number(data.session_id)) throw new ApiError(400,"Selected term does not belong to the selected academic session.");
    const classData = await classModel.getClassById(data.class_id, schoolId);
    if (!classData) throw new ApiError(404,"Class not found.");
    return classData;
};

const saveAttendance = async (data,userId,schoolId) => {
    if (!data.session_id) throw new ApiError(400,"Academic session is required.");
    if (!data.term_id) throw new ApiError(400,"Term is required.");
    if (!data.class_id) throw new ApiError(400,"Class is required.");
    if (!data.attendance_date) throw new ApiError(400,"Attendance date is required.");
    if (!Array.isArray(data.students) || !data.students.length) throw new ApiError(400,"No students were provided.");
    const classData = await validateContext(data,schoolId);
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const savedAttendance=[];
        for (const item of data.students) {
            const student=await studentModel.getStudentById(item.student_id,schoolId);
            if (!student) throw new ApiError(404,`Student with ID ${item.student_id} not found.`);
            if (!["PRESENT","ABSENT","LATE","EXCUSED"].includes(item.status)) throw new ApiError(400,`Invalid attendance status for ${student.first_name} ${student.surname}.`);
            const attendance=await attendanceModel.upsertAttendance({...item,session_id:data.session_id,term_id:data.term_id,class_id:data.class_id,arm_id:data.arm_id||null,attendance_date:data.attendance_date,marked_by:userId,school_id:schoolId},client);
            if (!attendance) throw new ApiError(403,"Attendance user or student does not belong to this school.");
            savedAttendance.push(attendance);
        }
        await client.query("COMMIT");
        return {attendance_date:data.attendance_date,class:classData.class_name,students_processed:savedAttendance.length,attendance:savedAttendance};
    } catch(error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
};

const getAttendanceByDate = async ({sessionId,termId,classId,armId,attendanceDate,schoolId}) => {
    if (!sessionId) throw new ApiError(400,"Academic session is required.");
    if (!termId) throw new ApiError(400,"Term is required.");
    if (!classId) throw new ApiError(400,"Class is required.");
    if (!attendanceDate) throw new ApiError(400,"Attendance date is required.");
    await validateContext({session_id:sessionId,term_id:termId,class_id:classId},schoolId);
    return attendanceModel.getAttendanceByDate({sessionId,termId,classId,armId:armId||null,attendanceDate,schoolId});
};

const getStudentAttendance = async ({studentId,sessionId,termId,schoolId}) => {
    if (!sessionId) throw new ApiError(400,"Academic session is required.");
    if (!termId) throw new ApiError(400,"Term is required.");
    const student=await studentModel.getStudentById(studentId,schoolId);
    if (!student) throw new ApiError(404,"Student not found.");
    await validateContext({session_id:sessionId,term_id:termId,class_id:student.class_id},schoolId);
    return attendanceModel.getStudentAttendance({studentId,sessionId,termId,schoolId});
};

const getAttendanceSummary = async (studentId,sessionId,termId,schoolId) => {
    const student=await studentModel.getStudentById(studentId,schoolId);
    if (!student) throw new ApiError(404,"Student not found.");
    const summary=await attendanceModel.getAttendanceSummary({studentId,sessionId,termId,schoolId});
    const totalDays=Number(summary.total_days||0),presentDays=Number(summary.present_days||0);
    return {...summary,total_days:totalDays,present_days:presentDays,absent_days:Number(summary.absent_days||0),late_days:Number(summary.late_days||0),excused_days:Number(summary.excused_days||0),attendance_percentage:totalDays===0?0:Number(((presentDays/totalDays)*100).toFixed(2))};
};

const getStudentsForAttendance = async ({sessionId,classId,armId,schoolId}) => {
    await validateContext({session_id:sessionId,term_id:(await sessionModel.getCurrentTermId?.(schoolId)),class_id:classId},schoolId).catch(()=>{});
    return studentEnrollmentModel.getStudentsForAttendance({sessionId,classId,armId,schoolId});
};

const getStudentsForTeacherAttendance = async (assignmentId,userId,schoolId) => {
    const assignment=await teacherAssignmentService.getAssignmentForTeacherAttendance(assignmentId,userId,schoolId);
    const students=await studentEnrollmentModel.getStudentsForAssignment(assignmentId,schoolId);
    return {assignment,students};
};

const getAttendanceByAssignment = async (assignmentId,attendanceDate,user,schoolId) => {
    if (!attendanceDate) throw new ApiError(400,"Attendance date is required.");
    const assignment=await teacherAssignmentService.getAssignmentForTeacherAttendance(assignmentId,user.id,schoolId);
    return attendanceModel.getAttendanceByDate({sessionId:assignment.session_id,termId:assignment.term_id,classId:assignment.class_id,armId:assignment.arm_id,attendanceDate,schoolId});
};

module.exports={saveAttendance,getAttendanceByDate,getStudentAttendance,getAttendanceSummary,getStudentsForAttendance,getStudentsForTeacherAttendance,getAttendanceByAssignment};