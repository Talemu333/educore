const Joi = require("joi");

const createPaymentSchema = Joi.object({

    student_id: Joi.number().integer().required(),

    session_id: Joi.number().integer().required(),

    term_id: Joi.number().integer().required(),

    amount_paid: Joi.number().positive().required(),

    payment_date: Joi.date().required(),

    payment_method: Joi.string()
        .valid("CASH", "TRANSFER", "POS", "ONLINE")
        .required(),

    received_by: Joi.number().integer().required(),

    remarks: Joi.string().allow("", null)

});

module.exports = {

    createPaymentSchema

};