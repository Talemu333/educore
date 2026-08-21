const Joi = require("joi");

const createClassSchema = Joi.object({
    class_name: Joi.string().trim().max(50).required(),

    class_level: Joi.string()
        .valid("Nursery", "Primary", "Junior", "Senior")
        .required(),

    sort_order: Joi.number()
        .integer()
        .required()
});

const updateClassSchema = Joi.object({
    class_name: Joi.string().trim().max(50).required(),

    class_level: Joi.string()
        .valid("Nursery", "Primary", "Junior Secondary", "Senior Secondary")
        .required(),

    sort_order: Joi.number()
        .integer()
        .required()
});

module.exports = {
    createClassSchema,
    updateClassSchema
};