const ApiError = require("../utils/ApiError");
const notificationModel = require("../models/notificationModel");
const userModel = require("../models/userModel");

const requireSchool = (schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
};

const createNotification = async (data, client = null) => {
    requireSchool(data.school_id);
    const user = await userModel.getUserById(data.user_id, data.school_id);
    if (!user) throw new ApiError(404, "User not found in this school.");
    return notificationModel.createNotification(data, client || undefined);
};

const getUserNotifications = async (userId, schoolId) => {
    requireSchool(schoolId);
    return notificationModel.getUserNotifications(userId, schoolId);
};

const markAsRead = async (notificationId, schoolId) => {
    requireSchool(schoolId);
    const notification = await notificationModel.getNotificationById(notificationId, schoolId);
    if (!notification) throw new ApiError(404, "Notification not found.");
    return notificationModel.markAsRead(notificationId, schoolId);
};

module.exports = { createNotification, getUserNotifications, markAsRead };
