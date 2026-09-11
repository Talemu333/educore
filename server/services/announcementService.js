const announcementModel = require("../models/announcementModel");
const ApiError = require("../utils/ApiError");

const requireSchool = (schoolId) => {
    if (!schoolId) {
        throw new ApiError(403, "School context is required.");
    }
};

const createAnnouncement = async (data, schoolId) => {
    requireSchool(schoolId);

    if (!data.title) {
        throw new ApiError(400, "Announcement title is required.");
    }

    if (!data.message) {
        throw new ApiError(400, "Announcement message is required.");
    }

    return announcementModel.createAnnouncement(data, schoolId);
};

const getAnnouncements = async (schoolId) => {
    requireSchool(schoolId);
    return announcementModel.getAnnouncements(schoolId);
};

const updateAnnouncement = async (id, data, schoolId) => {
    requireSchool(schoolId);

    const announcement = await announcementModel.updateAnnouncement(
        id,
        data,
        schoolId
    );

    if (!announcement) {
        throw new ApiError(404, "Announcement not found.");
    }

    return announcement;
};

const deactivateAnnouncement = async (id, schoolId) => {
    requireSchool(schoolId);

    const announcement = await announcementModel.deactivateAnnouncement(
        id,
        schoolId
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
