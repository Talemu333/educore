const sessionService = require("../services/sessionService");

const getSessions = async (req, res, next) => {

    try {

        const sessions = await sessionService.getSessions();

        res.json({

            success: true,

            data: sessions

        });

    } catch (err) {

        next(err);

    }

};

module.exports = {

    getSessions

};