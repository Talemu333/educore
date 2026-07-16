const studentService = require("../services/studentService");
const { createStudentSchema } = require("../validators/studentValidator");

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

module.exports = {

    createStudent

};