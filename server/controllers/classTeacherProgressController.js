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

const submitDraftReport = asyncHandler(async (req, res) => {
    const data = await service.submitDraftReport(req.params.reportId, req.user);
    res.json({ success: true, message: "Progress report submitted for review.", data });
});

const listReportsForReview = asyncHandler(async (req, res) => {
    const data = await service.listReportsForReview(req.user);
    res.json({ success: true, data });
});

const reviewReport = asyncHandler(async (req, res) => {
    const data = await service.reviewReport(req.params.reportId, req.body, req.user);
    res.json({ success: true, message: req.body.action === "return" ? "Report returned to the class teacher." : "Report approved.", data });
});

const publishReport = asyncHandler(async (req, res) => {
    const data = await service.publishReport(req.params.reportId, req.user);
    res.json({ success: true, message: "Progress report published for parents.", data });
});

module.exports = {
    listMyClasses, listClassStudents, createDraftReport, submitDraftReport,
    listReportsForReview, reviewReport, publishReport
};
