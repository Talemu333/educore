const ApiError = require("../utils/ApiError");

const notificationModel = require("../models/notificationModel");

const userModel = require("../models/userModel");

const createNotification = async (data, client = null) => {

    const user = await userModel.getUserById(data.user_id);

    if (!user) {

        throw new ApiError(
            404,
            "User not found."
        );

    }

    return await notificationModel.createNotification(
        data,
        client || undefined
    );

};

const getUserNotifications = async (userId) => {

    return await notificationModel.getUserNotifications(
        userId
    );

};

const markAsRead = async (notificationId) => {

    const notification =
        await notificationModel.getNotificationById(
            notificationId
        );

    if (!notification) {

        throw new ApiError(
            404,
            "Notification not found."
        );

    }

    return await notificationModel.markAsRead(
        notificationId
    );

};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead
}