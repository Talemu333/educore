const ApiError = require("../utils/ApiError");

const schoolSettingsModel = require(
    "../models/schoolSettingModel"
);

const sessionModel = require(
    "../models/sessionModel"
);

const termModel = require(
    "../models/termModel"
);

// const getSchoolSettings = async () => {

//     const settings =
//         await schoolSettingModel.getSchoolSettings();

//     if (!settings) {

//         throw new ApiError(

//             404,

//             "School settings not found."

//         );

//     }

//     return settings;

// };

const getSchoolSettings = async () => {

    const settings =

        await schoolSettingsModel
            .getSchoolSettings();


    if (!settings) {

        throw new ApiError(

            404,

            "School settings not found."

        );

    }


    return settings;

};


const updateSchoolSettings = async (
    data
) => {

    const existingSettings =

        await schoolSettingsModel
            .getSchoolSettings();


    if (!existingSettings) {

        throw new ApiError(

            404,

            "School settings not found."

        );

    }


    /*
    =====================================
    VALIDATE CURRENT SESSION
    =====================================
    */

    if (data.current_session_id) {

        const session =

            await sessionModel.getSessionById(

                data.current_session_id

            );


        if (!session) {

            throw new ApiError(

                404,

                "Selected academic session not found."

            );

        }

    }


    /*
    =====================================
    VALIDATE CURRENT TERM
    =====================================
    */

    if (data.current_term_id) {

        const term =

            await termModel.getTermById(

                data.current_term_id

            );


        if (!term) {

            throw new ApiError(

                404,

                "Selected term not found."

            );

        }


        /*
        Ensure the selected term belongs
        to the selected session
        */

        if (

            data.current_session_id &&

            Number(term.session_id) !==
            Number(data.current_session_id)

        ) {

            throw new ApiError(

                400,

                "Selected term does not belong to the selected academic session."

            );

        }

    }


    /*
    =====================================
    VALIDATE SCORES
    =====================================
    */

    const caMaxScore =

        Number(data.ca_max_score);


    const examMaxScore =

        Number(data.exam_max_score);


    const passingScore =

        Number(data.passing_score);


    if (

        Number.isNaN(caMaxScore) ||

        Number.isNaN(examMaxScore) ||

        Number.isNaN(passingScore)

    ) {

        throw new ApiError(

            400,

            "Academic score settings must be valid numbers."

        );

    }


    if (

        caMaxScore <= 0 ||

        examMaxScore <= 0

    ) {

        throw new ApiError(

            400,

            "CA and exam maximum scores must be greater than zero."

        );

    }


    const totalMaximumScore =

        caMaxScore +
        examMaxScore;


    if (

        passingScore < 0 ||

        passingScore > totalMaximumScore

    ) {

        throw new ApiError(

            400,

            `Passing score must be between 0 and ${totalMaximumScore}.`

        );

    }


    /*
    =====================================
    UPDATE SETTINGS
    =====================================
    */

    const updatedSettings =

        await schoolSettingsModel
            .updateSchoolSettings({

                ...data,

                id: existingSettings.id

            });


    return updatedSettings;

};


module.exports = {

    getSchoolSettings,

    updateSchoolSettings

};

