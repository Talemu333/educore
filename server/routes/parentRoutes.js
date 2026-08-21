const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLE_NAMES = require("../config/roleNames");
const parentController = require("../controllers/parentController");

router.use(authenticate);

router.get(

    "/dashboard",

    authorize(
        ROLE_NAMES.PARENT
    ),

    parentController.getParentDashboard

);

router.get(

    "/payments/summary/:studentId/:sessionId/:termId",

    authorize(
        ROLE_NAMES.PARENT
    ),

    parentController.getParentPaymentSummary

);


router.get(

    "/payments/history/:studentId/:sessionId/:termId",

    authorize(
        ROLE_NAMES.PARENT
    ),

    parentController.getParentPaymentHistory

);

router.get(
    "/",
    authorize(
        ROLE_NAMES.ADMIN,
        ROLE_NAMES.REGISTRAR
    ),
    parentController.getParents
);

router.post(
    "/",
    authorize(
        ROLE_NAMES.ADMIN,
        ROLE_NAMES.REGISTRAR
    ),
    parentController.createParent
);

router.put(
    "/:id",
    authorize(
        ROLE_NAMES.ADMIN,
        ROLE_NAMES.REGISTRAR
    ),
    parentController.updateParent
);

router.delete(
    "/students/:studentId/:parentId",
    authorize(
        ROLE_NAMES.ADMIN,
        ROLE_NAMES.REGISTRAR
    ),
    parentController.unlinkParent
);
router.post(

    "/link",

    authorize(

        ROLE_NAMES.ADMIN,

        ROLE_NAMES.REGISTRAR

    ),

    parentController.linkExistingParent

);

router.get(

    "/payments/fees/:studentId/:sessionId/:termId",

    authorize(
        ROLE_NAMES.PARENT
    ),

    parentController.getParentFeeBreakdown

);

router.get(
    "/financial-overview",
    authorize(ROLE_NAMES.ADMIN),
    parentController.getParentFinancialOverview
);

router.get(
    "/financial-overview/:parentId/:sessionId/:termId",
    authorize(ROLE_NAMES.ADMIN),
    parentController.getParentFinancialDetails
);


module.exports = router;