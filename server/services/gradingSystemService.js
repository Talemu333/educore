const ApiError =
    require("../utils/ApiError");

const gradingSystemModel =
    require("../models/gradingSystemModel");


const getAllGradingSystems = async () => {

    return await gradingSystemModel
        .getAllGradingScales();

};


const getGradingSystemById = async (id) => {

    const gradingSystem =

        await gradingSystemModel
            .getGradingSystemById(id);


    if (!gradingSystem) {

        throw new ApiError(

            404,

            "Grading system not found."

        );

    }


    return gradingSystem;

};


/*
=====================================
VALIDATE SCORE RANGE
=====================================
*/

const validateScoreRange = async (

    data,

    gradingSystemId = null

) => {

    const minScore =
        Number(data.min_score);

    const maxScore =
        Number(data.max_score);


    if (minScore > maxScore) {

        throw new ApiError(

            400,

            "Minimum score cannot be greater than maximum score."

        );

    }


    const gradingSystems =

        await gradingSystemModel
            .getAllGradingScales();


    const gradeExists =

        gradingSystems.find(

            item =>

                item.grade.toUpperCase() ===
                data.grade.toUpperCase()

                &&

                Number(item.id) !==
                Number(gradingSystemId)

        );


    if (gradeExists) {

        throw new ApiError(

            409,

            "This grade already exists."

        );

    }


    /*
    =====================================
    CHECK FOR OVERLAPPING SCORE RANGES
    =====================================
    */

    const overlappingGrade =

        gradingSystems.find(

            item => {

                if (

                    Number(item.id) ===
                    Number(gradingSystemId)

                ) {

                    return false;

                }


                const existingMin =
                    Number(item.min_score);

                const existingMax =
                    Number(item.max_score);


                return (

                    minScore <= existingMax

                    &&

                    maxScore >= existingMin

                );

            }

        );


    if (overlappingGrade) {

        throw new ApiError(

            409,

            `Score range overlaps with grade ${overlappingGrade.grade}.`

        );

    }

};


/*
=====================================
CREATE
=====================================
*/

const createGradingSystem = async (
    data
) => {

    await validateScoreRange(data);

    return await gradingSystemModel
        .createGradingSystem(data);

};


/*
=====================================
UPDATE
=====================================
*/

const updateGradingSystem = async (

    id,

    data

) => {

    const existing =

        await gradingSystemModel
            .getGradingSystemById(id);


    if (!existing) {

        throw new ApiError(

            404,

            "Grading system not found."

        );

    }


    await validateScoreRange(

        data,

        id

    );


    return await gradingSystemModel
        .updateGradingSystem(

            id,

            data

        );

};


/*
=====================================
DELETE
=====================================
*/

const deleteGradingSystem = async (
    id
) => {

    const existing =

        await gradingSystemModel
            .getGradingSystemById(id);


    if (!existing) {

        throw new ApiError(

            404,

            "Grading system not found."

        );

    }


    return await gradingSystemModel
        .deleteGradingSystem(id);

};


module.exports = {

    getAllGradingSystems,

    getGradingSystemById,

    createGradingSystem,

    updateGradingSystem,

    deleteGradingSystem

};