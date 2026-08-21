const promotionService =
    require("../services/promotionService");


/*
=========================================
GET PROMOTION SETUP
=========================================
*/

const getPromotionSetup = async (
    req,
    res,
    next
) => {

    try {

        const data =
            await promotionService
                .getPromotionSetup();


        res.json({

            success: true,

            data

        });


    } catch (error) {

        next(error);

    }

};


/*
=========================================
GET STUDENTS
=========================================
*/

const getStudentsForPromotion = async (
    req,
    res,
    next
) => {

    try {

        const {
            classId,
            armId
        } = req.query;


        if (!classId) {

            return res.status(400).json({

                success: false,

                message:
                    "Class is required."

            });

        }


        const students =
            await promotionService
                .getStudentsForPromotion({

                    classId:
                        Number(classId),

                    armId:
                        armId
                            ? Number(armId)
                            : null

                });


        res.json({

            success: true,

            data: students

        });


    } catch (error) {

        next(error);

    }

};


/*
=========================================
GET ARMS
=========================================
*/

const getArmsByClass = async (
    req,
    res,
    next
) => {

    try {

        const {
            classId
        } = req.params;


        if (!classId) {

            return res.status(400).json({

                success: false,

                message:
                    "Class ID is required."

            });

        }


        const arms =
            await promotionService
                .getArmsByClass(
                    Number(classId)
                );


        res.json({

            success: true,

            data: arms

        });


    } catch (error) {

        next(error);

    }

};


/*
=========================================
PROMOTE STUDENTS
=========================================
*/

const processStudentDecisions = async (
    req,
    res,
    next
) => {

    try {

        const {

            students,

            destinationClassId,

            defaultArmId

        } = req.body;


        if (
            !Array.isArray(students) ||
            students.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Select at least one student."

            });

        }


        /*
        =========================================
        USER WHO PROCESSED THE OPERATION
        =========================================
        */

        const processedBy =
            req.user?.id || null;


        const results =
            await promotionService
                .processStudentDecisions({

                    students,

                    destinationClassId:
                        destinationClassId
                            ? Number(
                                destinationClassId
                            )
                            : null,

                    defaultArmId:
                        defaultArmId
                            ? Number(
                                defaultArmId
                            )
                            : null,

                    processedBy

                });


        const promoted =
            results.filter(
                item =>
                    item.action ===
                    "Promoted"
            ).length;


        const repeated =
            results.filter(
                item =>
                    item.action ===
                    "Repeated"
            ).length;


        const graduated =
            results.filter(
                item =>
                    item.action ===
                    "Graduated"
            ).length;


        res.status(201).json({

            success: true,

            message:
                "Student decisions processed successfully.",

            summary: {

                promoted,

                repeated,

                graduated

            },

            data: results

        });


    } catch (error) {

        if (
            error.code === "23505"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "One or more students are already enrolled in the destination session."

            });

        }


        next(error);

    }

};


module.exports = {

    getPromotionSetup,

    getStudentsForPromotion,

    getArmsByClass,

    processStudentDecisions

};