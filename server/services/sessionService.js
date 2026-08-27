const sessionModel = require("../models/sessionModel");

const getSessions = async (schoolId) => {
    return await sessionModel.getSessions(schoolId);
};

const getSessionById = async (id, schoolId) => {
    return await sessionModel.getSessionById(id, schoolId);
};

const createSession = async (data, schoolId) => {
    return await sessionModel.createSession(data, schoolId);
};

const updateSession = async (id, data, schoolId) => {
    return await sessionModel.updateSession(id, data, schoolId);
};

const setCurrentSession = async (sessionId, schoolId) => {
    return await sessionModel.setCurrentSession(sessionId, schoolId);
};

module.exports = {
    getSessions,
    getSessionById,
    createSession,
    updateSession,
    setCurrentSession
};