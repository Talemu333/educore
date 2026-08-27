const armService = require("../services/armService");

const getArms = async (req, res, next) => {
    try {
        const arms = await armService.getArms(req.user.school_id);
        res.status(200).json({ success: true, data: arms });
    } catch (err) {
        next(err);
    }
};

const getArmsByClass = async (req, res, next) => {
    try {
        const arms = await armService.getArmsByClass(
            req.params.classId,
            req.user.school_id
        );
        res.status(200).json({ success: true, data: arms });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getArms,
    getArmsByClass
};
