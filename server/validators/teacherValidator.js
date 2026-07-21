const Joi = require("joi");

const createTeacherSchema = Joi.object({

    username: Joi.string()
        .trim()
        .min(4)
        .max(50)
        .required(),

    // password: Joi.string()
    //     .min(6)
    //     .required(),

    surname: Joi.string()
        .trim()
        .required(),

    first_name: Joi.string()
        .trim()
        .required(),

    middle_name: Joi.string()
        .allow("")
        .optional(),

    gender: Joi.string()
        .valid("Male", "Female")
        .required(),

    date_of_birth: Joi.date(),

    phone_number: Joi.string()
        .allow("")
        .optional(),

    email: Joi.string()
        .email()
        .allow("")
        .optional(),

    address: Joi.string()
        .allow("")
        .optional(),

    marital_status: Joi.string()
        .valid("Single", "Married", "Divorced", "Widowed")
        .optional(),

    qualification_id: Joi.number()
        .integer()
        .required(),

    department_id: Joi.number()
        .integer()
        .required(),

    employment_date: Joi.date()
        .required(),

    state_id: Joi.number()
        .integer()
        .required(),

    nationality_id: Joi.number()
        .integer()
        .required(),

    next_of_kin_name: Joi.string()
        .allow("")
        .optional(),

    next_of_kin_phone: Joi.string()
        .allow("")
        .optional(),

    emergency_contact_name: Joi.string()
        .allow("")
        .optional(),

    emergency_contact_phone: Joi.string()
        .allow("")
        .optional()

});

module.exports = {

    createTeacherSchema

};