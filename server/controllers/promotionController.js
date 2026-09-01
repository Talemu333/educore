const promotionService = require("../services/promotionService");

const getSchoolId = (req) => req.user?.school_id;

const getPromotionSetup = async (req, res, next) => {
    try {
        const data = await promotionService.getPromotionSetup(getSchoolId(req));
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getStudentsForPromotion = async (req, res, next) => {
    try {
        const { classId, armId } = req.query;
        if (!classId) {
            return res.status(400).json({ success: false, message: "Class is required." });
        }
        const students = await promotionService.getStudentsForPromotion({
            classId: Number(classId),
            armId: armId ? Number(armId) : null,
            schoolId: getSchoolId(req)
        });
        res.json({ success: true, data: students });
    } catch (error) {
        next(error);
    }
};

const getArmsByClass = async (req, res, next) => {
    try {
        const { classId } = req.params;
        if (!classId) {
            return res.status(400).json({ success: false, message: "Class ID is required." });
        }
        const arms = await promotionService.getArmsByClass(Number(classId), getSchoolId(req));
        res.json({ success: true, data: arms });
    } catch (error) {
        next(error);
    }
};

const processStudentDecisions = async (req, res, next) => {
    try {
        const { students, destinationClassId, defaultArmId } = req.body;
        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ success: false, message: "Select at least one student." });
        }

        const results = await promotionService.processStudentDecisions({
            students,
            destinationClassId: destinationClassId ? Number(destinationClassId) : null,
            defaultArmId: defaultArmId ? Number(defaultArmId) : null,
            processedBy: req.user?.id || null,
            schoolId: getSchoolId(req)
        });

        res.status(201).json({
            success: true,
            message: "Student decisions processed successfully.",
            summary: {
                promoted: results.filter(item => item.action === "Promoted").length,
                repeated: results.filter(item => item.action === "Repeated").length,
                graduated: results.filter(item => item.action === "Graduated").length
            },
            data: results
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "One or more students are already enrolled in the destination session."
            });
        }
        next(error);
    }
};

module.exports = {
    getPromotionSetup,
    getStudentsForPromotion,
    getArmsByClass,
    processStudentDecisions
};
