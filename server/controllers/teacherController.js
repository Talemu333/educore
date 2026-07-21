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

module.exports = {
    createTeacher,
    getTeachers,
    getTeacherById
}