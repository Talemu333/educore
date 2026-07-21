const promotionService = require("../services/promotionService");
const asyncHandler = require("../middlewares/asyncHandler");

const promoteStudents = asyncHandler(async (req, res) => {

    const result =
        await promotionService.promoteStudents(
            req.body
        );

    res.status(200).json({

        success: true,

        message:
            "Promotion completed successfully.",

        data: result

    });

});

module.exports = {
    promoteStudents
}