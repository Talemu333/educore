const asyncHandler = require("../middlewares/asyncHandler");
const teacherAssignmentService = require("../services/teacherAssignmentService");

const createAssignment = asyncHandler(async (req, res) => {

    const assignment =
        await teacherAssignmentService.createAssignment(req.body);

    res.status(201).json({

        success: true,

        message: "Teacher assigned successfully.",

        data: assignment

    });

});

const getAssignmentsByTeacher =
asyncHandler(async (req, res) => {

    const result =
        await teacherAssignmentService.getAssignmentsByTeacher(
            req.params.id
        );

    res.json({

        success: true,

        data: result

    });

});

module.exports = {

    createAssignment,
    getAssignmentsByTeacher

};