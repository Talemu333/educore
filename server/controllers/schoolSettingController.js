const schoolSettingsService =
    require("../services/schoolSettingService");

const asyncHandler =
    require("../middlewares/asyncHandler");

// const getSchoolSettings = asyncHandler(

//     async (req, res) => {

//         const settings =
//             await schoolSettingService
//                 .getSchoolSettings();

//         res.json({

//             success: true,

//             data: settings

//         });

//     }

// );

const getSchoolSettings = asyncHandler(

    async (req, res) => {

        const settings =

            await schoolSettingsService
                .getSchoolSettings();


        res.json({

            success: true,

            data: settings

        });

    }

);


const updateSchoolSettings = asyncHandler(

    async (req, res) => {

        const settings =

            await schoolSettingsService
                .updateSchoolSettings(

                    req.body

                );


        res.json({

            success: true,

            message:
                "School settings updated successfully.",

            data: settings

        });

    }

);


module.exports = {

    getSchoolSettings,

    updateSchoolSettings

};