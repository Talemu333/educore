const teacherService = require("../services/teacherService");
const asyncHandler = require("../middlewares/asyncHandler");

const getSchoolId = (req) => req.user?.school_id;

const createTeacher = asyncHandler(async (req, res) => {
    const result = await teacherService.createTeacher(req.body, getSchoolId(req));
    res.status(201).json({ success: true, message: "Teacher created successfully.", data: result });
});

const getTeachers = asyncHandler(async (req, res) => {
    const result = await teacherService.getTeachers(req.query, getSchoolId(req));
    res.json({ success: true, ...result });
});

const getTeacherById = asyncHandler(async (req, res) => {
    const teacher = await teacherService.getTeacherById(req.params.id, getSchoolId(req));
    res.json({ success: true, data: teacher });
});

const getMyProfile = asyncHandler(async (req, res) => {
    const teacher = await teacherService.getMyProfile(req.user);
    res.json({ success: true, data: teacher });
});

const updateTeacherUsername = asyncHandler(async (req, res) => {
    const result = await teacherService.updateTeacherUsername(
        req.params.id,
        req.body.username,
        getSchoolId(req)
    );
    res.json({ success: true, message: "Teacher username updated successfully.", data: result });
});

const updateTeacher = asyncHandler(async (req, res) => {
    const teacher = await teacherService.updateTeacher(req.params.id, req.body, getSchoolId(req));
    res.json({ success: true, message: "Teacher updated successfully.", data: teacher });
});

const deactivateTeacher = asyncHandler(async (req, res) => {
    await teacherService.deactivateTeacher(req.params.id, getSchoolId(req));
    res.json({ success: true, message: "Teacher deactivated successfully." });
});

module.exports = { createTeacher, getTeachers, getTeacherById, getMyProfile, updateTeacherUsername, updateTeacher, deactivateTeacher };
