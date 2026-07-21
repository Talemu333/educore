const Joi = require("joi");

const createResultSchema = Joi.object({

    student_id: Joi.number()
        .integer()
        .required(),

    teacher_assignment_id: Joi.number()
        .integer()
        .required(),

    session_id: Joi.number()
        .integer()
        .required(),

    term_id: Joi.number()
        .integer()
        .required(),

    ca_score: Joi.number()
        .min(0)
        .max(30)
        .required(),

    exam_score: Joi.number()
        .min(0)
        .max(70)
        .required()

});

const createBulkResultsSchema = Joi.object({

    teacher_assignment_id: Joi.number()
        .integer()
        .required(),

    session_id: Joi.number()
        .integer()
        .required(),

    term_id: Joi.number()
        .integer()
        .required(),

    results: Joi.array()
        .items(

            Joi.object({

                student_id: Joi.number()
                    .integer()
                    .required(),

                ca_score: Joi.number()
                    .min(0)
                    .max(30)
                    .required(),

                exam_score: Joi.number()
                    .min(0)
                    .max(70)
                    .required()

            })

        )
        .min(1)
        .required()

});

module.exports = {

    createResultSchema,
    createBulkResultsSchema

};