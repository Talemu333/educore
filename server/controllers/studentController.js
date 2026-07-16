const studentService = require("../services/studentService");
const { createStudentSchema } = require("../validators/studentValidator");
const { updateStudentSchema } = require("../validators/studentValidator");

const createStudent = async (req, res, next) => {
    const { error } = createStudentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    try {

        const student = await studentService.createStudent(req.body);

        res.status(201).json({

            success: true,

            message: "Student admitted successfully.",

            data: student

        });

    } catch (err) {

        next(err);

    }

};

const getAllStudents = async (req, res, next) => {

    try {

        const students = await studentService.getAllStudents();

        res.json({

            success: true,

            count: students.length,

            data: students

        });

    } catch (err) {

        next(err);

    }

};

const getStudentById = async (req, res, next) => {

    try {
        const student = await studentService.getStudentById(req.params.id);

        res.json({

            success: true,

            data: student

        });

    } catch (err) {
        next(err);
    }
};

const updateStudent = async (req, res, next) => {

    try {

        const { error } = updateStudentSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const student = await studentService.updateStudent(
            req.params.id,
            req.body
        );

        res.json({

            success: true,

            message: "Student updated successfully.",

            data: student

        });

    } catch (err) {

        next(err);

    }

};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent
};