const promotionHistoryService = require("../services/promotionHistoryService");

const getPromotionHistory = async (req, res, next) => {
    try {
        const {
            action,
            sessionId,
            search,
            page = 1,
            limit = 20
        } = req.query;

        if (action && !["Promoted", "Repeated", "Graduated"].includes(action)) {
            return res.status(400).json({ success: false, message: "Invalid promotion action." });
        }

        if (sessionId && (Number.isNaN(Number(sessionId)) || Number(sessionId) <= 0)) {
            return res.status(400).json({ success: false, message: "Invalid session ID." });
        }

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (!Number.isInteger(pageNumber) || pageNumber < 1) {
            return res.status(400).json({ success: false, message: "Invalid page number." });
        }

        if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
            return res.status(400).json({ success: false, message: "Limit must be between 1 and 100." });
        }

        const schoolId = req.user?.school_id;

        if (!schoolId) {
            return res.status(403).json({
                success: false,
                message: "School context is required."
            });
        }

        const data = await promotionHistoryService.getPromotionHistory({
            schoolId: Number(schoolId),
            action,
            sessionId: sessionId ? Number(sessionId) : null,
            search: search?.trim() || null,
            page: pageNumber,
            limit: limitNumber
        });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

module.exports = { getPromotionHistory };
