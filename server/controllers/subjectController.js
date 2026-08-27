const subjectService = require("../services/subjectService");
const asyncHandler = require("../middlewares/asyncHandler");

const getSubjects = asyncHandler(async (req, res) => {
    const subjects = await subjectService.getSubjects(req.user.school_id);
    res.json({ success: true, count: subjects.length, data: subjects });
});

const createSubject = asyncHandler(async (req, res) => {
    const subject = await subjectService.createSubject(
        req.body,
        req.user.school_id
    );
    res.status(201).json({
        success: true,
        message: "Subject created successfully.",
        data: subject
    });
});

const getSubjectsByClass = asyncHandler(async (req, res) => {
    const subjects = await subjectService.getSubjectsByClass(
        req.params.classId,
        req.user.school_id
    );
    res.json({ success: true, data: subjects });
});

module.exports = {
    getSubjects,
    createSubject,
    getSubjectsByClass
};
