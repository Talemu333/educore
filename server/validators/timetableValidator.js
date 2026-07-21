const Joi = require("joi");

const createTimetableSchema = Joi.object({

    teacher_assignment_id: Joi.number()
        .integer()
        .required(),

    day_of_week: Joi.string()
        .valid(
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
        )
        .required(),

    start_time: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required(),

    end_time: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required(),

    room: Joi.string()
        .max(30)
        .allow("", null)

});

module.exports = {
    createTimetableSchema
}