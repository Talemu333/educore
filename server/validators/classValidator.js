const Joi = require("joi");

const classSchema = Joi.object({
    class_name: Joi.string()
        .trim()
        .max(20)
        .required(),

    class_level: Joi.string()
        .valid("Junior", "Senior")
        .required(),

    sort_order: Joi.number()
        .integer()
        .min(1)
        .required()
});

module.exports = classSchema;