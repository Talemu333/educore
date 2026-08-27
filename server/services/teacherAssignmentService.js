const ApiError = require("../utils/ApiError");
const teacherAssignmentModel = require("../models/teacherAssignmentModel");
const teacherModel = require("../models/teacherModel");
const subjectModel = require("../models/subjectModel");
const classModel = require("../models/classModel");
const armModel = require("../models/armModel");
const sessionModel = require("../models/sessionModel");
const termModel = require("../models/termModel");

const validateAssignment = async (assignment, schoolId, assignmentId = null) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    const teacher = await teacherModel.getTeacherById(assignment.teacher_id, schoolId);
    if (!teacher) throw new ApiError(404, "Teacher not found.");
    const subject = await subjectModel.getSubjectById(assignment.subject_id, schoolId);
    if (!subject) throw new ApiError(404, "Subject not found.");
    const schoolClass = await classModel.getClassById(assignment.class_id, schoolId);
    if (!schoolClass) throw new ApiError(404, "Class not found.");
    if (assignment.arm_id) {
        const arm = await armModel.getArmById(assignment.arm_id, schoolId);
        if (!arm) throw new ApiError(404, "Arm not found.");
    }
    const session = await sessionModel.getSessionById(assignment.session_id, schoolId);
    if (!session) throw new ApiError(404, "Academic session not found.");
    const term = await termModel.getTermById(assignment.term_id, schoolId);
    if (!term) throw new ApiError(404, "Term not found.");
    if (Number(term.session_id) !== Number(assignment.session_id)) throw new ApiError(400, "Selected term does not belong to the selected academic session.");
    const duplicate = await teacherAssignmentModel.findDuplicateAssignment(assignment, schoolId);
    if (duplicate && Number(duplicate.id) !== Number(assignmentId)) throw new ApiError(409, "This teacher has already been assigned to this subject for the selected class, arm, term and session.");
};

const createAssignment = async (assignment, schoolId) => {
    await validateAssignment(assignment, schoolId);
    const created = await teacherAssignmentModel.createAssignment(assignment, schoolId);
    if (!created) throw new ApiError(400, "Teacher does not belong to this school.");
    return teacherAssignmentModel.getAssignmentById(created.id, schoolId);
};

const getAssignmentsByTeacher = async (teacherId, schoolId) => {
    const teacher = await teacherModel.getTeacherById(teacherId, schoolId);
    if (!teacher) throw new ApiError(404, "Teacher not found.");
    const assignments = await teacherAssignmentModel.getAssignmentsByTeacher(teacherId, schoolId);
    return { teacher: { id: teacher.id, staff_number: teacher.staff_number, full_name: `${teacher.surname} ${teacher.first_name}` }, totalAssignments: assignments.length, assignments };
};

const deleteAssignment = async (id, schoolId) => {
    const assignment = await teacherAssignmentModel.getAssignmentDetails(id, schoolId);
    if (!assignment) throw new ApiError(404, "Assignment not found.");
    try {
        const deleted = await teacherAssignmentModel.deleteAssignment(id, schoolId);
        if (!deleted) throw new ApiError(404, "Assignment not found.");
    } catch (error) {
        if (error.code === "23503") throw new ApiError(400, "Cannot delete this assignment because it is already used in the timetable.");
        throw error;
    }
};

const updateAssignment = async (id, assignment, schoolId) => {
    if (!await teacherAssignmentModel.getAssignmentDetails(id, schoolId)) throw new ApiError(404, "Assignment not found.");
    await validateAssignment(assignment, schoolId, id);
    const updated = await teacherAssignmentModel.updateAssignment(id, assignment, schoolId);
    if (!updated) throw new ApiError(404, "Assignment not found.");
    return teacherAssignmentModel.getAssignmentById(updated.id, schoolId);
};

const getMyAssignments = async (user) => {
    const schoolId = user?.school_id;
    const teacher = await teacherModel.getTeacherByUserId(user.id, schoolId);
    if (!teacher) throw new ApiError(404, "Teacher profile not found.");
    return getAssignmentsByTeacher(teacher.id, schoolId);
};

const getAllAssignments = async (schoolId) => {
    const assignments = await teacherAssignmentModel.getAllAssignments(schoolId);
    return { totalAssignments: assignments.length, assignments };
};

const getAssignmentForTeacherAttendance = async (assignmentId, userId, schoolId) => {
    const teacher = await teacherModel.getTeacherByUserId(userId, schoolId);
    if (!teacher) throw new ApiError(404, "Teacher profile not found.");
    const assignment = await teacherAssignmentModel.getAssignmentForAttendance(assignmentId, schoolId);
    if (!assignment) throw new ApiError(404, "Assignment not found.");
    if (Number(assignment.teacher_id) !== Number(teacher.id)) throw new ApiError(403, "You are not authorized to access this assignment.");
    return assignment;
};

const getMyStudents = async (user) => {
    const schoolId = user?.school_id;
    const teacher = await teacherModel.getTeacherByUserId(user.id, schoolId);
    if (!teacher) throw new ApiError(404, "Teacher profile not found.");
    const students = await teacherAssignmentModel.getStudentsByTeacher(teacher.id, schoolId);
    return { teacher: { id: teacher.id, staff_number: teacher.staff_number, full_name: `${teacher.surname} ${teacher.first_name}` }, totalStudents: students.length, students };
};

module.exports={createAssignment,getAssignmentsByTeacher,deleteAssignment,updateAssignment,getMyAssignments,getAllAssignments,getAssignmentForTeacherAttendance,getMyStudents};