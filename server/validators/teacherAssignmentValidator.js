const Joi = require("joi");

const createAssignmentSchema = Joi.object({

    teacher_id: Joi.number()
        .integer()
        .required(),

    subject_id: Joi.number()
        .integer()
        .required(),

    class_id: Joi.number()
        .integer()
        .required(),

    arm_id: Joi.number()
        .integer()
        .allow(null),

    session_id: Joi.number()
        .integer()
        .required(),

    term_id: Joi.number()
        .integer()
        .required()

});

module.exports = {

    createAssignmentSchema

};