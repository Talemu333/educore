const service = require("../services/academicProgrammeService");
const asyncHandler = require("../middlewares/asyncHandler");

const get = asyncHandler(async (req, res) => {
    const data = await service.listProgrammes(req.query.class_id, req.user.school_id, req.schoolDatabase);
    res.json({ success: true, data });
});
const create = asyncHandler(async (req, res) => {
    const data = await service.createProgramme(req.body, req.user.school_id, req.schoolDatabase);
    res.status(201).json({ success: true, message: "Academic programme created.", data });
});
const saveSubjects = asyncHandler(async (req, res) => {
    const data = await service.saveProgrammeSubjects(req.params.id, req.body.subjects || [], req.user.school_id, req.schoolDatabase);
    res.json({ success: true, message: "Programme subjects saved.", data });
});
const students = asyncHandler(async (req, res) => {
    const data = await service.getStudentsForProgrammeAssignment(req.query, req.user.school_id, req.schoolDatabase);
    res.json({ success: true, data });
});
const assign = asyncHandler(async (req, res) => {
    const data = await service.assignStudents(req.body, req.user.school_id, req.user.id, req.schoolDatabase);
    res.json({ success: true, message: "Student programme and subjects assigned.", data });
});
module.exports = { get, create, saveSubjects, students, assign };
