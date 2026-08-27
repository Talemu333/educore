const { createClassSchema } = require("../validators/classValidator");
const validate = require("../middlewares/validate");
const classService = require("../services/classService");
const { successResponse, errorResponse } = require("../utils/response");

const getSchoolId = (req) => req.user?.school_id;

const getClasses = async (req, res, next) => {
    try {
        const classes = await classService.getClasses(getSchoolId(req));
        res.status(200).json({ success: true, data: classes });
    } catch (err) { next(err); }
};

const getClassArms = async (req, res, next) => {
    try {
        const arms = await classService.getClassArms(req.params.id, getSchoolId(req));
        res.status(200).json({ success: true, data: arms });
    } catch (err) { next(err); }
};

const createClass = async (req, res) => {
    const { error } = createClassSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, 400);
    try {
        const newClass = await classService.createClass(req.body, getSchoolId(req));
        return successResponse(res, "Class created successfully.", newClass, 201);
    } catch (err) {
        console.error(err);
        return errorResponse(res, err.message || "Failed to create class.", err.statusCode || 500);
    }
};

module.exports = { getClasses, getClassArms, createClass };