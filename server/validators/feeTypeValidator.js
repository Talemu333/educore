const Joi = require("joi");

const createFeeTypeSchema = Joi.object({

    fee_name: Joi.string()
        .trim()
        .max(100)
        .required(),

    description: Joi.string()
        .allow("", null)

});

const updateFeeTypeSchema = Joi.object({

    fee_name: Joi.string()
        .trim()
        .max(100)
        .required(),

    description: Joi.string()
        .allow("", null)

});

module.exports = {

    createFeeTypeSchema,

    updateFeeTypeSchema

};