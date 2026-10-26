const asyncHandler = require("../middlewares/asyncHandler");
const service = require("../services/classTeacherAssignmentService");

const getSchoolId = (req) => req.user?.school_id;

const listAssignments = asyncHandler(async (req, res) => {
    const data = await service.listAssignments(getSchoolId(req));
    res.json({ success: true, data });
});

const createAssignment = asyncHandler(async (req, res) => {
    const data = await service.createAssignment(req.body, getSchoolId(req), req.user?.id);
    res.status(201).json({ success: true, message: "Class teacher assigned successfully.", data });
});

const deactivateAssignment = asyncHandler(async (req, res) => {
    await service.deactivateAssignment(req.params.id, getSchoolId(req));
    res.json({ success: true, message: "Class teacher assignment deactivated." });
});

module.exports = { listAssignments, createAssignment, deactivateAssignment };
