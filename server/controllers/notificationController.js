const notificationService = require("../services/notificationService");
const asyncHandler = require("../middlewares/asyncHandler");

const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await notificationService.getUserNotifications(
        req.user.id,
        req.user.school_id
    );
    res.json({ success: true, data: notifications });
});

const markAsRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(
        req.params.id,
        req.user.school_id
    );
    res.json({ success: true, data: notification });
});

module.exports = { getMyNotifications, markAsRead };
