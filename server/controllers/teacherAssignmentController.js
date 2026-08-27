const asyncHandler = require("../middlewares/asyncHandler");
const teacherAssignmentService = require("../services/teacherAssignmentService");

const getSchoolId = (req) => req.user?.school_id;

const createAssignment = asyncHandler(async (req, res) => {
    const assignment = await teacherAssignmentService.createAssignment(req.body, getSchoolId(req));
    res.status(201).json({ success: true, message: "Teacher assigned successfully.", data: assignment });
});

const getAssignmentsByTeacher = asyncHandler(async (req, res) => {
    const result = await teacherAssignmentService.getAssignmentsByTeacher(req.params.id, getSchoolId(req));
    res.json({ success: true, data: result });
});

const deleteAssignment = asyncHandler(async (req, res) => {
    await teacherAssignmentService.deleteAssignment(req.params.id, getSchoolId(req));
    res.json({ success: true, message: "Teacher assignment deleted successfully." });
});

const updateAssignment = asyncHandler(async (req, res) => {
    const assignment = await teacherAssignmentService.updateAssignment(req.params.id, req.body, getSchoolId(req));
    res.json({ success: true, message: "Assignment updated successfully.", data: assignment });
});

const getMyAssignments = asyncHandler(async (req, res) => {
    const result = await teacherAssignmentService.getMyAssignments(req.user);
    res.json({ success: true, data: result });
});

const getAllAssignments = asyncHandler(async (req, res) => {
    const result = await teacherAssignmentService.getAllAssignments(getSchoolId(req));
    res.json({ success: true, data: result });
});

const getMyStudents = asyncHandler(async (req, res) => {
    const result = await teacherAssignmentService.getMyStudents(req.user);
    res.json({ success: true, data: result });
});

module.exports = { createAssignment, getAssignmentsByTeacher, deleteAssignment, updateAssignment, getMyAssignments, getAllAssignments, getMyStudents };