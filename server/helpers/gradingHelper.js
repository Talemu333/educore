const gradingSystemModel =
    require("../models/gradingSystemModel");


const getGrade = async (totalScore) => {

    const grading =

        await gradingSystemModel.getGradeForScore(
            Number(totalScore)
        );


    if (!grading) {

        return {

            grade: "F",

            remark: "Fail"

        };

    }


    return {

        grade: grading.grade,

        remark: grading.remark

    };

};


module.exports = {

    getGrade

};