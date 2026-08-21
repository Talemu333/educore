const teacherService = require("../services/teacherService");
const asyncHandler = require("../middlewares/asyncHandler");

const createTeacher = asyncHandler(async (req, res) => {

    const result = await teacherService.createTeacher(req.body);

    res.status(201).json({

        success: true,

        message: "Teacher created successfully.",

        data: result

    });

});

const getTeachers = asyncHandler(async (req, res) => {

    const teachers = await teacherService.getTeachers();

    res.json({

        success: true,

        count: teachers.length,

        data: teachers

    });

});

const getTeacherById = asyncHandler(async (req, res) => {

    const teacher = await teacherService.getTeacherById(
        req.params.id
    );

    res.json({

        success: true,

        data: teacher

    });

});

const updateTeacher = asyncHandler(async (req, res) => {

    const teacher = await teacherService.updateTeacher(

        req.params.id,

        req.body

    );

    res.json({

        success: true,

        message: "Teacher updated successfully.",

        data: teacher

    });

});

const deactivateTeacher = asyncHandler(async (req, res) => {

    await teacherService.deactivateTeacher(

        req.params.id

    );

    res.json({

        success: true,

        message: "Teacher deactivated successfully."

    });

});

module.exports = {
    createTeacher,
    getTeachers,
    getTeacherById,
    updateTeacher,
    deactivateTeacher
}