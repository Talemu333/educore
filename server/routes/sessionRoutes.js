const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");

const sessionController =
    require("../controllers/sessionController");


/*
=========================================
GET ALL SESSIONS
=========================================
*/

router.get(
    "/",
    authenticate,
    sessionController.getSessions
);


/*
=========================================
GET SESSION BY ID
=========================================
*/

router.get(
    "/:id",
    authenticate,
    sessionController.getSessionById
);


/*
=========================================
CREATE SESSION
=========================================
*/

router.post(
    "/",
    authenticate,
    sessionController.createSession
);


/*
=========================================
UPDATE SESSION
=========================================
*/

router.put(
    "/:id",
    authenticate,
    sessionController.updateSession
);

/*
=========================================
SET CURRENT SESSION
=========================================
*/

router.patch(
    "/:id/current",
    authenticate,
    sessionController.setCurrentSession
);


module.exports = router;