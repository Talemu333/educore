const express = require("express");

const router = express.Router();

const controller =
    require("../controllers/passwordController");

const authenticate =
    require("../middlewares/authenticate");


router.patch(

    "/change",

    authenticate,

    controller.changePassword

);


module.exports = router;