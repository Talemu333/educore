const Joi = require("joi");

const createAttendanceSchema = Joi.object({

    session_id: Joi.number()
        .integer()
        .required(),

    term_id: Joi.number()
        .integer()
        .required(),

    class_id: Joi.number()
        .integer()
        .required(),

    arm_id: Joi.number()
        .integer()
        .allow(null),

    attendance_date: Joi.date()
        .required(),

    students: Joi.array()

        .items(

            Joi.object({

                student_id: Joi.number()
                    .integer()
                    .required(),

                status: Joi.string()

                    .valid(

                        "PRESENT",

                        "ABSENT",

                        "LATE",

                        "EXCUSED"

                    )

                    .required()

            })

        )

        .min(1)

        .required()

});

module.exports = {
    createAttendanceSchema
}