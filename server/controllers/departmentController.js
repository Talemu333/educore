const asyncHandler = require("../middlewares/asyncHandler");

const departmentService = require("../services/departmentService");

const getDepartments = asyncHandler(async (req, res) => {

    const departments = await departmentService.getDepartments();

    res.json({

        success: true,

        data: departments

    });

});

module.exports = {

    getDepartments

};