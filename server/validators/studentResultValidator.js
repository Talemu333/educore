const Joi = require("joi");

const scoreSchema = Joi.number()
    .min(0)
    .required();

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

    ca_score: scoreSchema,

    exam_score: scoreSchema

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

                ca_score: scoreSchema,

                exam_score: scoreSchema

            })

        )
        .min(1)
        .required()

});


module.exports = {

    createResultSchema,

    createBulkResultsSchema

};