const promotionHistoryService =
    require("../services/promotionHistoryService");


/*
=========================================
GET PROMOTION HISTORY
=========================================
*/

const getPromotionHistory = async (
    req,
    res,
    next
) => {

    try {

        const {

            action,

            sessionId,

            search,

            page = 1,

            limit = 20

        } = req.query;


        /*
        =====================================
        VALIDATE ACTION
        =====================================
        */

        if (
            action &&
            ![
                "Promoted",
                "Repeated",
                "Graduated"
            ].includes(action)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid promotion action."

            });

        }


        /*
        =====================================
        VALIDATE SESSION
        =====================================
        */

        if (
            sessionId &&
            (
                Number.isNaN(
                    Number(sessionId)
                )
                ||
                Number(sessionId) <= 0
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid session ID."

            });

        }


        /*
        =====================================
        VALIDATE PAGINATION
        =====================================
        */

        const pageNumber =
            Number(page);


        const limitNumber =
            Number(limit);


        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid page number."

            });

        }


        if (
            !Number.isInteger(limitNumber) ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Limit must be between 1 and 100."

            });

        }


        /*
        =====================================
        FETCH HISTORY
        =====================================
        */

        const data =
            await promotionHistoryService
                .getPromotionHistory({

                    action,

                    sessionId:
                        sessionId
                            ? Number(
                                sessionId
                            )
                            : null,

                    search:
                        search?.trim() ||
                        null,

                    page:
                        pageNumber,

                    limit:
                        limitNumber

                });


        /*
        =====================================
        RESPONSE
        =====================================
        */

        res.json({

            success: true,

            data

        });

    } catch (error) {

        next(error);

    }

};


module.exports = {

    getPromotionHistory

};