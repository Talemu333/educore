const Joi = require("joi");

const createArmSchema = Joi.object({

    class_id: Joi.number()
        .integer()
        .required(),

    arm_name: Joi.string()
        .trim()
        .max(50)
        .required()

});

module.exports = {

    createArmSchema

};