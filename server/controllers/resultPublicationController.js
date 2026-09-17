const asyncHandler = require("../middlewares/asyncHandler");
const ApiError = require("../utils/ApiError");
const resultPublicationModel = require("../models/resultPublicationModel");

const getSchoolId = req => Number(req.user?.school_id);

const publishClassTermResults = asyncHandler(async (req, res) => {
    const schoolId = getSchoolId(req);
    const classId = Number(req.body.class_id);
    const armId = req.body.arm_id ? Number(req.body.arm_id) : null;
    const sessionId = Number(req.body.session_id);
    const termId = Number(req.body.term_id);

    if (![schoolId, classId, sessionId, termId].every(Number.isInteger) || schoolId < 1 || classId < 1 || sessionId < 1 || termId < 1) {
        throw new ApiError(400, "School, class, session and term are required to publish results.");
    }

    const publication = await resultPublicationModel.publishClassTermResults({
        schoolId,
        classId,
        armId,
        sessionId,
        termId,
        publishedBy: Number(req.user.id),
    });

    return res.json({
        success: true,
        message: "Result published successfully. Students can now view their report.",
        data: publication,
    });
});

const getPublication = asyncHandler(async (req, res) => {
    const publication = await resultPublicationModel.getPublication(
        getSchoolId(req),
        Number(req.query.classId),
        req.query.armId ? Number(req.query.armId) : null,
        Number(req.query.sessionId),
        Number(req.query.termId)
    );

    return res.json({ success: true, data: publication });
});

module.exports = { publishClassTermResults, getPublication };
