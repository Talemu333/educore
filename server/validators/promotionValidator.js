const Joi = require("joi");
const createPromotionSchema = Joi.object({

    current_session_id: Joi.number()
        .integer()
        .required(),

    next_session_id: Joi.number()
        .integer()
        .required(),

    students: Joi.array()
        .items(

            Joi.object({

                student_id: Joi.number()
                    .integer()
                    .required(),

                next_class_id: Joi.number()
                    .integer()
                    .required(),

                next_arm_id: Joi.number()
                    .integer()
                    .allow(null),

                status: Joi.string()
                    .valid(

                        "PROMOTED",

                        "REPEATED",

                        "TRANSFERRED"

                    )
                    .required()

            })

        )
        .min(1)
        .required()

});