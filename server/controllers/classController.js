const classModel = require("../models/classModel");

const getClasses = async (req, res) => {
    try {
        const classes = await classModel.getAllClasses();

        res.status(200).json({
            success: true,
            message: "Classes retrieved successfully.",
            data: classes
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

module.exports = {
    getClasses
};