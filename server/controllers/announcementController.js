const announcementService = require("../services/announcementService");
const asyncHandler = require("../middlewares/asyncHandler");
const getSchoolId = (req) => req.user?.school_id;

const createAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await announcementService.createAnnouncement(req.body, getSchoolId(req), req.user, req.schoolDatabase);
    res.status(201).json({ success: true, message: "Announcement created successfully.", data: announcement });
});

const getAnnouncements = asyncHandler(async (req, res) => {
    const announcements = await announcementService.getAnnouncements(getSchoolId(req), req.user, req.schoolDatabase);
    res.status(200).json({ success: true, data: announcements });
});

const getAnnouncementNotifications = asyncHandler(async (req, res) => {
    const announcements = await announcementService.getAnnouncementNotifications(getSchoolId(req), req.user, req.schoolDatabase);
    const unreadCount = announcements.filter((item) => !item.is_read).length;
    res.status(200).json({ success: true, data: { announcements, unread_count: unreadCount } });
});

const markAnnouncementRead = asyncHandler(async (req, res) => {
    const read = await announcementService.markAnnouncementRead(req.params.id, getSchoolId(req), req.user, req.schoolDatabase);
    res.status(200).json({ success: true, message: "Announcement marked as read.", data: read });
});

const markAllAnnouncementsRead = asyncHandler(async (req, res) => {
    const count = await announcementService.markAllAnnouncementsRead(getSchoolId(req), req.user, req.schoolDatabase);
    res.status(200).json({ success: true, message: "Announcements marked as read.", data: { marked_count: count } });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await announcementService.updateAnnouncement(req.params.id, req.body, getSchoolId(req), req.user, req.schoolDatabase);
    res.json({ success: true, message: "Announcement updated successfully.", data: announcement });
});

const deactivateAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await announcementService.deactivateAnnouncement(req.params.id, getSchoolId(req), req.user, req.schoolDatabase);
    res.json({ success: true, message: "Announcement deactivated successfully.", data: announcement });
});


const uploadAnnouncementAttachments = asyncHandler(async (req, res) => {
    const attachments = await announcementService.uploadAnnouncementAttachments(
        req.params.id, req.files, getSchoolId(req), req.user, req.schoolDatabase
    );
    res.status(201).json({ success: true, message: "Attachments uploaded successfully.", data: attachments });
});

const downloadAnnouncementAttachment = asyncHandler(async (req, res) => {
    const attachment = await announcementService.getAnnouncementAttachmentForUser(
        req.params.id, req.params.attachmentId, getSchoolId(req), req.user, req.schoolDatabase
    );
    res.setHeader("Content-Type", attachment.mime_type);
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(attachment.file_name)}`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");
    res.status(200).send(attachment.file_data);
});

const deleteAnnouncementAttachment = asyncHandler(async (req, res) => {
    const attachment = await announcementService.deleteAnnouncementAttachment(
        req.params.id, req.params.attachmentId, getSchoolId(req), req.user, req.schoolDatabase
    );
    res.status(200).json({ success: true, message: "Attachment deleted.", data: attachment });
});

module.exports = {
    createAnnouncement, getAnnouncements, getAnnouncementNotifications,
    markAnnouncementRead, markAllAnnouncementsRead, updateAnnouncement, deactivateAnnouncement,
    uploadAnnouncementAttachments, downloadAnnouncementAttachment, deleteAnnouncementAttachment
};
