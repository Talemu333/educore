const express = require("express");
const router = express.Router();
const studentResultController = require("../controllers/studentResultController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");

const {
    createResultSchema,
    createBulkResultsSchema
} = require("../validators/studentResultValidator");

const ROLES = require("../config/roles");

router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.TEACHER),
    validate(createResultSchema),
    studentResultController.createResult
);

router.post(
    "/bulk",
    authenticate,
    authorize(ROLES.ADMIN, ROLES.TEACHER),
    validate(createBulkResultsSchema),
    studentResultController.createBulkResults
);

module.exports = router;