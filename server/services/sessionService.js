const sessionModel = require("../models/sessionModel");


/*
=========================================
GET ALL SESSIONS
=========================================
*/

const getSessions = async () => {

    return await sessionModel.getSessions();

};


/*
=========================================
GET SESSION BY ID
=========================================
*/

const getSessionById = async (id) => {

    return await sessionModel.getSessionById(id);

};


/*
=========================================
CREATE SESSION
=========================================
*/

const createSession = async (data) => {

    return await sessionModel.createSession(data);

};


/*
=========================================
UPDATE SESSION
=========================================
*/

const updateSession = async (id, data) => {

    return await sessionModel.updateSession(
        id,
        data
    );

};


/*
=========================================
SET CURRENT SESSION
=========================================
*/

const setCurrentSession = async (sessionId) => {

    return await sessionModel.setCurrentSession(
        sessionId
    );

};


/*
=========================================
EXPORT
=========================================
*/

module.exports = {

    getSessions,

    getSessionById,

    createSession,

    updateSession,

    setCurrentSession

};