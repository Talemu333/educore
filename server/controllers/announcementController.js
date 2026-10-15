const announcementService = require("../services/announcementService");
const asyncHandler = require("../middlewares/asyncHandler");
const getSchoolId = (req) => req.user?.school_id;

const createAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await announcementService.createAnnouncement(req.body, getSchoolId(req), req.user.id, req.schoolDatabase);
    res.status(201).json({ success: true, message: "Announcement created successfully.", data: announcement });
});

const getAnnouncements = asyncHandler(async (req, res) => {
    const announcements = await announcementService.getAnnouncements(getSchoolId(req), req.user, req.schoolDatabase);
    res.status(200).json({ success: true, data: announcements });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await announcementService.updateAnnouncement(req.params.id, req.body, getSchoolId(req), req.schoolDatabase);
    res.json({ success: true, message: "Announcement updated successfully.", data: announcement });
});

const deactivateAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await announcementService.deactivateAnnouncement(req.params.id, getSchoolId(req), req.schoolDatabase);
    res.json({ success: true, message: "Announcement deactivated successfully.", data: announcement });
});

module.exports = { createAnnouncement, getAnnouncements, updateAnnouncement, deactivateAnnouncement };
