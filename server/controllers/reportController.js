const reportService = require("../services/reportService");
const asyncHandler = require("../middlewares/asyncHandler");

const getStudentReport = asyncHandler(async (req, res) => {

    const report =
        await reportService.getStudentReport(

            req.params.studentId,

            req.query.session_id,

            req.query.term_id

        );

    res.json({

        success: true,

        data: report

    });

});

module.exports = {
    getStudentReport
}
