const reportService = require("../services/reportService");
const asyncHandler = require("../middlewares/asyncHandler");

const getStudentReport = asyncHandler(async (req, res) => {

    const report =
        await reportService.getStudentReport(

            req.params.studentId,

            req.query.sessionId,

            req.query.termId

        );

    res.json({

        success: true,

        data: report

    });

});

const getStudentTranscript = asyncHandler(async (req, res) => {

    const transcript = await reportService.getStudentTranscript(

        req.params.studentId

    );

    res.status(200).json({

        success: true,

        data: transcript

    });

});

module.exports = {
    getStudentReport,
    getStudentTranscript
}
