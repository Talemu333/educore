const studentService = require("../services/studentService");
const asyncHandler = require("../middlewares/asyncHandler");

const schoolId = (req) => req.user?.school_id;

const createStudent = asyncHandler(async (req, res) => {
    const student = await studentService.createStudent(req.body, schoolId(req));
    res.status(201).json({ success: true, message: "Student created successfully.", data: student });
});

const getAllStudents = asyncHandler(async (req, res) => {
    const result = await studentService.getAllStudents(req.query, schoolId(req));
    res.json({ success: true, ...result });
});

const getStudentById = asyncHandler(async (req, res) => {
    const student = await studentService.getStudentById(req.params.id, schoolId(req));
    res.json({ success: true, data: student });
});

const updateStudent = asyncHandler(async (req, res) => {
    const student = await studentService.updateStudent(req.params.id, req.body, schoolId(req));
    res.json({ success: true, message: "Student updated successfully.", data: student });
});

const searchStudents = asyncHandler(async (req, res) => {
    const students = await studentService.searchStudents(req.query.q, schoolId(req));
    res.json({ success: true, data: students });
});

const deactivateStudent = asyncHandler(async (req, res) => {
    await studentService.deactivateStudent(req.params.id, schoolId(req));
    res.json({ success: true, message: "Student deactivated successfully." });
});

const getStudentParents = asyncHandler(async (req, res) => {
    const parents = await studentService.getStudentParents(req.params.id, schoolId(req));
    res.json({ success: true, data: parents });
});

module.exports = { createStudent, getAllStudents, getStudentById, updateStudent, searchStudents, deactivateStudent, getStudentParents };
