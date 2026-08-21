const Joi = require("joi");


const gradingSystemSchema = Joi.object({

    grade: Joi.string()
        .trim()
        .uppercase()
        .max(5)
        .required(),

    min_score: Joi.number()
        .min(0)
        .max(100)
        .required(),

    max_score: Joi.number()
        .min(0)
        .max(100)
        .greater(Joi.ref("min_score"))
        .required(),

    remark: Joi.string()
        .trim()
        .max(100)
        .required()

});


module.exports = {

    gradingSystemSchema

};