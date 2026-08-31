const armService = require("../services/armService");
const { successResponse, errorResponse } = require("../utils/response");

const getSchoolId = (req) => req.user?.school_id;

const createArm = async (req, res) => {
    try {
        const { class_id, arm_name } = req.body;

        if (!class_id || !arm_name || !String(arm_name).trim()) {
            return errorResponse(res, "class_id and arm_name are required.", 400);
        }

        const arm = await armService.createArm(
            { class_id, arm_name: String(arm_name).trim() },
            getSchoolId(req)
        );

        return successResponse(res, "Arm created successfully.", arm, 201);
    } catch (err) {
        return errorResponse(
            res,
            err.message || "Failed to create arm.",
            err.statusCode || 500
        );
    }
};

const getArms = async (req, res, next) => {
    try {
        const arms = await armService.getArms(getSchoolId(req));
        res.status(200).json({ success: true, data: arms });
    } catch (err) {
        next(err);
    }
};

const getArmsByClass = async (req, res, next) => {
    try {
        const arms = await armService.getArmsByClass(
            req.params.classId,
            getSchoolId(req)
        );
        res.status(200).json({ success: true, data: arms });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createArm,
    getArms,
    getArmsByClass
};
