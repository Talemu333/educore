const classModel = require("../models/classModel");
const classSchema = require("../validators/classValidator");
const {
    successResponse,
    errorResponse
} = require("../utils/response");

const getClasses = async (req, res) => {

    try {

        const classes = await classModel.getAllClasses();

        return successResponse(
            res,
            "Classes retrieved successfully.",
            classes
        );

    } catch (error) {

        console.error(error);

        return errorResponse(
            res,
            "Internal server error."
        );
    }

};

const createClass = async (req, res) => {

    const { error } = classSchema.validate(req.body);

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
    createClass
};