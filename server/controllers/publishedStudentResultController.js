const asyncHandler = require("../middlewares/asyncHandler");
const ApiError = require("../utils/ApiError");
const studentResultService = require("../services/studentResultService");
const resultPublicationModel = require("../models/resultPublicationModel");

const getSchoolId = req => Number(req.user?.school_id);

const getPublishedStudentResultReport = asyncHandler(async (req, res) => {
    const schoolId = getSchoolId(req);
    const studentId = Number(req.user?.student_id || req.params.studentId);
    const sessionId = Number(req.params.sessionId);
    const termId = Number(req.params.termId);

    if (!Number.isInteger(studentId) || studentId < 1) {
        throw new ApiError(403, "Student account is not linked to a student record.");
    }

    const published = await resultPublicationModel.isStudentResultPublished(
        studentId,
        sessionId,
        termId,
        schoolId
    );

    if (!published) {
        throw new ApiError(404, "This result has not been published yet.");
    }

    const data = await studentResultService.getStudentResultReport(
        studentId,
        sessionId,
        termId,
        schoolId
    );

    return res.json({ success: true, data });
});

module.exports = { getPublishedStudentResultReport };
