const asyncHandler = require("../middlewares/asyncHandler");
const parentService = require("../services/parentService");

const createParent = asyncHandler(async (req, res) => {

    const parent = await parentService.createParent(req.body);

    res.status(201).json({

        success: true,

        message: "Parent created successfully.",

        data: parent

    });

});

const updateParent = asyncHandler(async (req, res) => {

    const parent = await parentService.updateParent(

        req.params.id,

        req.body

    );

    res.status(200).json({

        success: true,

        message: "Parent updated successfully.",

        data: parent

    });

});

const unlinkParent = asyncHandler(async (req, res) => {

    await parentService.unlinkParent(

        req.params.studentId,

        req.params.parentId

    );

    res.status(200).json({

        success: true,

        message: "Parent removed successfully."

    });

});

const getParents = asyncHandler(async (req, res) => {

    const parents = await parentService.getParents();

    res.json({

        success: true,

        data: parents

    });

});

const linkExistingParent = asyncHandler(async (req, res) => {

    const link = await parentService.linkExistingParent(req.body);

    res.status(201).json({

        success: true,

        message: "Parent linked successfully.",

        data: link

    });

});

const getParentDashboard = asyncHandler(
    async (req, res) => {

        const dashboard =
            await parentService.getParentDashboard(
                req.user.id
            );

        res.json({

            success: true,

            data: dashboard

        });

    }
);

const getParentPaymentSummary = asyncHandler(
    async (req, res) => {

        const summary =
            await parentService.getParentPaymentSummary(

                req.user.id,

                req.params.studentId,

                req.params.sessionId,

                req.params.termId

            );

        res.json({

            success: true,

            data: summary

        });

    }
);


const getParentPaymentHistory = asyncHandler(
    async (req, res) => {

        const payments =
            await parentService.getParentPaymentHistory(

                req.user.id,

                req.params.studentId,

                req.params.sessionId,

                req.params.termId

            );

        res.json({

            success: true,

            data: payments

        });

    }
);

const getParentFeeBreakdown = asyncHandler(
    async (req, res) => {

        const breakdown =
            await parentService.getParentFeeBreakdown(
                req.user.id,
                req.params.studentId
            );

        res.json({

            success: true,

            data: breakdown

        });

    }
);

const getParentFinancialOverview = asyncHandler(
    async (req, res) => {

        const {
            sessionId,
            termId
        } = req.query;

        if (!sessionId || !termId) {

            return res.status(400).json({
                success: false,
                message:
                    "sessionId and termId are required."
            });

        }

        const overview =
            await parentService.getParentFinancialOverview(
                Number(sessionId),
                Number(termId)
            );

        res.json({

            success: true,

            data: overview

        });

    }
);

const getParentFinancialDetails = asyncHandler(
    async (req, res) => {

        const {
            parentId,
            sessionId,
            termId
        } = req.params;

        const details =
            await parentService.getParentFinancialDetails(
                Number(parentId),
                Number(sessionId),
                Number(termId)
            );

        res.json({

            success: true,

            data: details

        });

    }
);

module.exports = {

    createParent,

    updateParent,

    unlinkParent,
    getParents,
    linkExistingParent,
    getParentDashboard,
    getParentPaymentSummary,
    getParentPaymentHistory,
    getParentFeeBreakdown,
    getParentFinancialOverview,
    getParentFinancialDetails

};