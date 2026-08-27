const termService = require("../services/termService");

const getTerms = async (req, res, next) => {
    try {
        const terms = await termService.getTerms(req.user.school_id);

        res.json({
            success: true,
            data: terms
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getTerms
};