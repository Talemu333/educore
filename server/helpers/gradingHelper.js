const getGrade = (totalScore) => {

    if (totalScore >= 70) {

        return {
            grade: "A",
            remark: "Excellent"
        };

    }

    if (totalScore >= 60) {

        return {
            grade: "B",
            remark: "Very Good"
        };

    }

    if (totalScore >= 50) {

        return {
            grade: "C",
            remark: "Good"
        };

    }

    if (totalScore >= 45) {

        return {
            grade: "D",
            remark: "Fair"
        };

    }

    if (totalScore >= 40) {

        return {
            grade: "E",
            remark: "Pass"
        };

    }

    return {
        grade: "F",
        remark: "Fail"
    };

};

module.exports = {

    getGrade

};