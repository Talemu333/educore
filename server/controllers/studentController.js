const studentService = require("../services/studentService");
const studentAccountService = require("../services/studentAccountService");
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

const getMyStudentProfile = asyncHandler(async (req, res) => {
    const student = await studentService.getStudentByUserId(req.user.id, schoolId(req));
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

const createStudentAccount = asyncHandler(async (req, res) => {
    const account = await studentAccountService.createStudentAccount(req.params.id, schoolId(req));
    res.status(201).json({ success: true, message: "Student login account created successfully.", data: account });
});

const getStudentAccount = asyncHandler(async (req, res) => {
    const account = await studentAccountService.getStudentAccount(req.params.id, schoolId(req));
    res.json({ success: true, data: account });
});

module.exports = { createStudent, getAllStudents, getStudentById, getMyStudentProfile, updateStudent, searchStudents, deactivateStudent, getStudentParents, createStudentAccount, getStudentAccount };
