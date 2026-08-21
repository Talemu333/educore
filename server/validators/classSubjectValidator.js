const Joi = require("joi");

const createClassSubjectsSchema = Joi.object({

    class_id: Joi.number()

        .integer()

        .required(),

    subjects: Joi.array()

        .items(

            Joi.object({

                subject_id: Joi.number()

                    .integer()

                    .required(),

                is_compulsory: Joi.boolean()

                    .required()

            })

        )

        .min(1)

        .required()

});

module.exports = {

    createClassSubjectsSchema

};