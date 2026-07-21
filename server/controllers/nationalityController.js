const nationalityService = require("../services/nationalityService");

const getNationalities = async (req, res, next) => {

    try {

        const nationalities = await nationalityService.getNationalities();

        res.json({
            success: true,
            data: nationalities
        });

    } catch (err) {

        next(err);

    }

};

module.exports = {
    getNationalities
};