const Joi = require("joi");

const createStudentSchema = Joi.object({

    surname: Joi.string().trim().required(),

    first_name: Joi.string().trim().required(),

    middle_name: Joi.string().allow("").optional(),

    gender: Joi.string()
        .valid("Male", "Female")
        .required(),

    date_of_birth: Joi.date().required(),

    session_id: Joi.number()
        .integer()
        .positive()
        .required(),

    class_id: Joi.number().integer().required(),

    arm_id: Joi.number().integer().required(),

    state_id: Joi.number().integer().required(),

    nationality_id: Joi.number().integer().required(),

    religion: Joi.string().allow("").optional(),

    blood_group: Joi.string().allow("").optional(),

    genotype: Joi.string().allow("").optional(),

    residential_address: Joi.string().required(),

    admission_date: Joi.date().required()

});

const updateStudentSchema = Joi.object({

    surname: Joi.string().trim().required(),

    first_name: Joi.string().trim().required(),

    middle_name: Joi.string().allow("").optional(),

    gender: Joi.string()
        .valid("Male", "Female")
        .required(),

    date_of_birth: Joi.date().required(),

    state_id: Joi.number().integer().required(),

    nationality_id: Joi.number().integer().required(),

    religion: Joi.string().allow("").optional(),

    blood_group: Joi.string().allow("").optional(),

    genotype: Joi.string().allow("").optional(),

    residential_address: Joi.string().required(),

    class_id: Joi.number().integer().required(),

    arm_id: Joi.number().integer().required()

});

module.exports = {

    createStudentSchema,
    updateStudentSchema

};