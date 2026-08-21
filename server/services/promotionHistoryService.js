const promotionHistoryModel =
    require("../models/promotionHistoryModel");


/*
=========================================
GET PROMOTION HISTORY
=========================================
*/

const getPromotionHistory = async ({
    action,
    sessionId,
    search,
    page,
    limit
}) => {

    return await promotionHistoryModel
        .getPromotionHistory({

            action,

            sessionId,

            search,

            page,

            limit

        });

};


module.exports = {

    getPromotionHistory

};