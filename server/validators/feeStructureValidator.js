const Joi = require("joi");

const createFeeStructureSchema = Joi.object({

    session_id: Joi.number()
        .integer()
        .required(),

    term_id: Joi.number()
        .integer()
        .required(),

    class_id: Joi.number()
        .integer()
        .required(),

    fee_type_id: Joi.number()
        .integer()
        .required(),

    amount: Joi.number()
        .positive()
        .required()

});

const updateFeeStructureSchema = Joi.object({

    amount: Joi.number()
        .positive()
        .required()

});

module.exports = {

    createFeeStructureSchema,

    updateFeeStructureSchema

};

