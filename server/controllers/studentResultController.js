const studentResultService = require("../services/studentResultService");
const asyncHandler = require("../middlewares/asyncHandler");

const createResult = asyncHandler(async (req, res) => {

    const result = await studentResultService.createResult(req.body);

    res.status(201).json({
        success: true,
        message: "Result created successfully.",
        data: result
    });

});

const createBulkResults = asyncHandler(async (req, res) => {

    await studentResultService.createBulkResults(req.body);

    res.status(201).json({
        success: true,
        message: "Results uploaded successfully."
    });

});

const getStudentsForAssignment = asyncHandler(async (req, res) => {

    const students =
        await studentResultService.getStudentsForAssignment(

            req.params.assignmentId

        );

    res.json({

        success: true,

        data: students

    });

});

const getStudentsForResultEntry =
asyncHandler(async (req, res) => {

    const data =
        await studentResultService
            .getStudentsForResultEntry(
                req.params.assignmentId
            );

    res.json({

        success: true,

        data

    });

});

const getStudentResultReport =
asyncHandler(async (req, res) => {

    const report =
        await studentResultService
            .getStudentResultReport(

                req.params.studentId,

                req.params.sessionId,

                req.params.termId

            );

    res.json({

        success: true,

        data: report

    });

});

const getClassResultSheet =
asyncHandler(async (req, res) => {

    const {

        classId,

        armId,

        sessionId,

        termId

    } = req.query;


    const data =
        await studentResultService
            .getClassResultSheet(

                classId,

                armId || null,

                sessionId,

                termId

            );


    res.json({

        success: true,

        data

    });

});

const getClassBroadsheet =
asyncHandler(async (req, res) => {

    const {
        classId,
        armId,
        sessionId,
        termId
    } = req.query;

    const data =
        await studentResultService
            .getClassBroadsheet(

                Number(classId),

                armId
                    ? Number(armId)
                    : null,

                Number(sessionId),

                Number(termId)

            );

    res.json({

        success: true,

        data

    });

});

module.exports = {

    createResult,
    createBulkResults,
    getStudentsForAssignment,
    getStudentsForResultEntry,
    getStudentResultReport,
    getClassResultSheet,
    getClassBroadsheet

};