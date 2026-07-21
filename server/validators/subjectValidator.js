const Joi = require("joi");

const createSubjectSchema = Joi.object({

    subject_name: Joi.string()
        .trim()
        .max(100)
        .required(),

    subject_code: Joi.string()
        .trim()
        .uppercase()
        .max(20)
        .required(),

    is_core: Joi.boolean()

});

module.exports = {
    createSubjectSchema
};