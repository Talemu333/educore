const promotionHistoryModel = require("../models/promotionHistoryModel");

const getPromotionHistory = async ({
    schoolId,
    action,
    sessionId,
    search,
    page,
    limit
}) => {
    return await promotionHistoryModel.getPromotionHistory({
        schoolId,
        action,
        sessionId,
        search,
        page,
        limit
    });
};

module.exports = { getPromotionHistory };
