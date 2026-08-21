const relationshipService = require("../services/relationshipService");

const getRelationships = async (req, res, next) => {

    try {

        const relationships = await relationshipService.getRelationships();

        res.json({

            success: true,

            data: relationships

        });

    } catch (error) {

        next(error);

    }

};

module.exports = {

    getRelationships

};