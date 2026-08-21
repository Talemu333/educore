const asyncHandler = require("../middlewares/asyncHandler");

const classSubjectService = require("../services/classSubjectService");

const saveClassSubjects =
asyncHandler(async (req, res) => {

    const result =
        await classSubjectService.saveClassSubjects(
            req.body
        );

    res.status(200).json({

        success: true,

        message: "Class subjects updated successfully.",

        data: result

    });

});

const getClassSubjects =
asyncHandler(async (req, res) => {

    const result =
        await classSubjectService.getClassSubjects(
            req.params.classId
        );

    res.json({

        success: true,

        data: result

    });

});

module.exports = {

    saveClassSubjects,

    getClassSubjects

};