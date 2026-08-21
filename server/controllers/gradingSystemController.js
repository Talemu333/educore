const asyncHandler =
    require("../middlewares/asyncHandler");

const gradingSystemService =
    require("../services/gradingSystemService");


const getAllGradingSystems =

    asyncHandler(

        async (req, res) => {

            const gradingSystems =

                await gradingSystemService
                    .getAllGradingSystems();


            res.json({

                success: true,

                data: gradingSystems

            });

        }

    );


const getGradingSystemById =

    asyncHandler(

        async (req, res) => {

            const gradingSystem =

                await gradingSystemService
                    .getGradingSystemById(

                        req.params.id

                    );


            res.json({

                success: true,

                data: gradingSystem

            });

        }

    );


const createGradingSystem =

    asyncHandler(

        async (req, res) => {

            const gradingSystem =

                await gradingSystemService
                    .createGradingSystem(

                        req.body

                    );


            res.status(201).json({

                success: true,

                message:

                    "Grade created successfully.",

                data: gradingSystem

            });

        }

    );


const updateGradingSystem =

    asyncHandler(

        async (req, res) => {

            const gradingSystem =

                await gradingSystemService
                    .updateGradingSystem(

                        req.params.id,

                        req.body

                    );


            res.json({

                success: true,

                message:

                    "Grade updated successfully.",

                data: gradingSystem

            });

        }

    );


const deleteGradingSystem =

    asyncHandler(

        async (req, res) => {

            await gradingSystemService
                .deleteGradingSystem(

                    req.params.id

                );


            res.json({

                success: true,

                message:

                    "Grade deleted successfully."

            });

        }

    );


module.exports = {

    getAllGradingSystems,

    getGradingSystemById,

    createGradingSystem,

    updateGradingSystem,

    deleteGradingSystem

};