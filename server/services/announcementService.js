const announcementModel = require("../models/announcementModel");
const ApiError = require("../utils/ApiError");

const requireSchool = (schoolId) => {
    if (!schoolId) {
        throw new ApiError(403, "School context is required.");
    }
};

const createAnnouncement = async (data, schoolId, db) => {
    requireSchool(schoolId);

    if (!data.title) {
        throw new ApiError(400, "Announcement title is required.");
    }

    if (!data.message) {
        throw new ApiError(400, "Announcement message is required.");
    }

    return announcementModel.createAnnouncement(data, schoolId, db);
};

const getAnnouncements = async (schoolId, db) => {
    requireSchool(schoolId);
    return announcementModel.getAnnouncements(schoolId, db);
};

const updateAnnouncement = async (id, data, schoolId, db) => {
    requireSchool(schoolId);

    const announcement = await announcementModel.updateAnnouncement(
        id,
        data,
        schoolId,
        db
    );

    if (!announcement) {
        throw new ApiError(404, "Announcement not found.");
    }

    return announcement;
};

const deactivateAnnouncement = async (id, schoolId, db) => {
    requireSchool(schoolId);

    const announcement = await announcementModel.deactivateAnnouncement(
        id,
        schoolId,
        db
    );

    if (!announcement) {
        throw new ApiError(404, "Announcement not found.");
    }

    return announcement;
};

module.exports = {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deactivateAnnouncement
};
