const asyncHandler = require("../middlewares/asyncHandler");
const ApiError = require("../utils/ApiError");
const pool = require("../config/database");
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

    const resultCheck = await pool.query(`
        SELECT COUNT(*)::int AS count
        FROM student_results sr
        JOIN teacher_assignments ta ON ta.id = sr.teacher_assignment_id
        JOIN students s ON s.id = sr.student_id
        WHERE sr.session_id = $1
          AND sr.term_id = $2
          AND ta.class_id = $3
          AND (ta.arm_id = $4 OR (ta.arm_id IS NULL AND $4 IS NULL))
          AND s.school_id = $5;
    `, [sessionId, termId, classId, armId, schoolId]);

    if (Number(resultCheck.rows[0]?.count || 0) === 0) {
        throw new ApiError(400, "There are no student results for the selected class, arm, session and term.");
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
