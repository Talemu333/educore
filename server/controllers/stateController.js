const stateService = require("../services/stateService");

const getStates = async (req, res, next) => {

    try {

        const states = await stateService.getStates();

        res.json({
            success: true,
            data: states
        });

    } catch (err) {

        next(err);

    }

};

module.exports = {
    getStates
};