const asyncHandler = require("../middlewares/asyncHandler");
const service = require("../services/classTeacherProgressService");

const listMyClasses = asyncHandler(async (req, res) => {
    const data = await service.listMyClasses(req.user);
    res.json({ success: true, data });
});

const listClassStudents = asyncHandler(async (req, res) => {
    const data = await service.listClassStudents(req.params.assignmentId, req.user);
    res.json({ success: true, data });
});

const createDraftReport = asyncHandler(async (req, res) => {
    const data = await service.createDraftReport(req.body, req.user);
    res.status(201).json({ success: true, message: "Progress report draft saved.", data });
});

module.exports = { listMyClasses, listClassStudents, createDraftReport };
