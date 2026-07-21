const studentService = require("../services/studentService");
const { createStudentSchema } = require("../validators/studentValidator");
const { updateStudentSchema } = require("../validators/studentValidator");
const asyncHandler = require("../middlewares/asyncHandler");

const createStudent = asyncHandler(async (req, res) => {

    const student = await studentService.createStudent(req.body);

    res.status(201).json({

        success: true,

        message: "Student created successfully.",

        data: student

    });

});

const getAllStudents = asyncHandler(async (req, res) => {

    const students = await studentService.getAllStudents(req.query);

    res.json({

        success: true,

        count: students.length,

        data: students

    });

});

const getStudentById = asyncHandler(async (req, res) => {

    const student = await studentService.getStudentById(req.params.id);

    res.json({

        success: true,

        data: student

    });

});

const updateStudent = asyncHandler(async (req, res) => {

    const student = await studentService.updateStudent(
        req.params.id,
        req.body
    );

    res.json({

        success: true,

        message: "Student updated successfully.",

        data: student

    });

});

const searchStudents = asyncHandler(

    async (req, res) => {

        const students =
            await studentService.searchStudents(
                req.query.q
            );

        res.json({

            success: true,

            data: students

        });

    }

);

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    searchStudents
};