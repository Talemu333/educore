const classModel = require("../models/classModel");
const {createClassSchema} = require("../validators/classValidator");
const validate = require("../middlewares/validate");
const classService = require("../services/classService");
const {
    successResponse,
    errorResponse
} = require("../utils/response");


const getClasses = async (req, res, next) => {
    try {

        const classes = await classService.getClasses();

        res.status(200).json({
            success: true,
            data: classes
        });

    } catch (err) {
        next(err);
    }
};

const getClassArms = async (req, res, next) => {

    try {

        const arms = await classService.getClassArms(req.params.id);

        res.status(200).json({

            success: true,

            data: arms

        });

    } catch (err) {

        next(err);

    }

};

const createClass = async (req, res) => {

    const { error } = createClassSchema.validate(req.body);

    if (error) {

        return errorResponse(
            res,
            error.details[0].message,
            400
        );
    }

    try {

        const newClass =
            await classModel.createClass(req.body);

        return successResponse(
            res,
            "Class created successfully.",
            newClass,
            201
        );

    } catch (err) {

        console.error(err);

        return errorResponse(
            res,
            "Failed to create class."
        );
    }

};

module.exports = {
    getClasses,
    getClassArms,
    createClass
};