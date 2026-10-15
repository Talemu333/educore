const announcementModel = require("../models/announcementModel");
const ApiError = require("../utils/ApiError");

const ALLOWED_AUDIENCES = new Set(["all", "students", "teachers", "parents", "administrators", "class"]);
const requireSchool = (schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
};

const normalizeAnnouncement = (data) => {
    const title = String(data.title || "").trim();
    const message = String(data.message || "").trim();
    const audience = String(data.audience || "all").trim().toLowerCase();
    const publishDate = data.publish_date || new Date().toISOString().slice(0, 10);
    const expiryDate = data.expiry_date || null;
    const isActive = data.is_active === undefined ? true : data.is_active;
    const isPinned = data.is_pinned === undefined ? false : data.is_pinned;
    const attachmentUrl = String(data.attachment_url || "").trim() || null;
    const attachmentLabel = String(data.attachment_label || "").trim() || null;
    const targetClassId = data.target_class_id === "" || data.target_class_id == null ? null : Number(data.target_class_id);
    const targetArmId = data.target_arm_id === "" || data.target_arm_id == null ? null : Number(data.target_arm_id);

    if (!title) throw new ApiError(400, "Announcement title is required.");
    if (title.length > 200) throw new ApiError(400, "Announcement title must be 200 characters or fewer.");
    if (!message) throw new ApiError(400, "Announcement message is required.");
    if (!ALLOWED_AUDIENCES.has(audience)) throw new ApiError(400, "Please select a valid announcement audience.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(publishDate))) throw new ApiError(400, "A valid publication date is required.");
    if (expiryDate && !/^\d{4}-\d{2}-\d{2}$/.test(String(expiryDate))) throw new ApiError(400, "Please provide a valid expiry date.");
    if (expiryDate && expiryDate < publishDate) throw new ApiError(400, "The expiry date cannot be earlier than the publication date.");
    if (typeof isActive !== "boolean" || typeof isPinned !== "boolean") throw new ApiError(400, "Announcement status and pin setting must be boolean values.");
    if (attachmentUrl) {
        let parsed;
        try { parsed = new URL(attachmentUrl); } catch { throw new ApiError(400, "Enter a valid attachment URL."); }
        if (parsed.protocol !== "https:") throw new ApiError(400, "Attachment links must use HTTPS.");
        if (attachmentUrl.length > 2000) throw new ApiError(400, "Attachment URL is too long.");
    }
    if (attachmentLabel && attachmentLabel.length > 160) throw new ApiError(400, "Attachment label must be 160 characters or fewer.");
    if (audience === "class") {
        if (!Number.isInteger(targetClassId) || targetClassId < 1) throw new ApiError(400, "Select a class for a class-specific announcement.");
        if (targetArmId !== null && (!Number.isInteger(targetArmId) || targetArmId < 1)) throw new ApiError(400, "Select a valid class arm.");
    } else if (targetClassId !== null || targetArmId !== null) {
        throw new ApiError(400, "Class and arm targeting can only be used for class-specific announcements.");
    }
    return {
        title, message, audience, publish_date: publishDate, expiry_date: expiryDate,
        is_active: isActive, is_pinned: isPinned, attachment_url: attachmentUrl,
        attachment_label: attachmentLabel, target_class_id: targetClassId, target_arm_id: targetArmId
    };
};

const canManageAnnouncements = (user) => {
    const role = String(user?.role_name || user?.role || "").trim().toLowerCase();
    const type = String(user?.admin_type || "").trim().toLowerCase();
    return role === "principal" || (role === "admin" && ["proprietor", "principal", "vice_principal"].includes(type));
};

const getAudienceForUser = (user) => {
    const role = String(user?.role_name || user?.role || "").trim().toLowerCase();
    if (role === "student") return "students";
    if (role === "teacher") return "teachers";
    if (role === "parent") return "parents";
    return "administrators";
};

const requireManager = (user) => {
    if (!canManageAnnouncements(user)) throw new ApiError(403, "You do not have permission to manage announcements.");
};

const createAnnouncement = async (data, schoolId, user, db) => {
    requireSchool(schoolId);
    requireManager(user);
    return announcementModel.createAnnouncement({ ...normalizeAnnouncement(data), created_by: user.id }, schoolId, db);
};

const getAnnouncements = async (schoolId, user, db) => {
    requireSchool(schoolId);
    if (canManageAnnouncements(user)) return announcementModel.getAnnouncementsForManagement(schoolId, db);
    return announcementModel.getAnnouncementsForAudience(schoolId, getAudienceForUser(user), user.id, db);
};

const getAnnouncementNotifications = async (schoolId, user, db) => {
    requireSchool(schoolId);
    return announcementModel.getAnnouncementsForAudience(schoolId, getAudienceForUser(user), user.id, db);
};

const updateAnnouncement = async (id, data, schoolId, user, db) => {
    requireSchool(schoolId);
    requireManager(user);
    const announcement = await announcementModel.updateAnnouncement(id, normalizeAnnouncement(data), schoolId, db);
    if (!announcement) throw new ApiError(404, "Announcement not found.");
    return announcement;
};

const deactivateAnnouncement = async (id, schoolId, user, db) => {
    requireSchool(schoolId);
    requireManager(user);
    const announcement = await announcementModel.deactivateAnnouncement(id, schoolId, db);
    if (!announcement) throw new ApiError(404, "Announcement not found.");
    return announcement;
};

const markAnnouncementRead = async (id, schoolId, user, db) => {
    requireSchool(schoolId);
    const visible = await getAnnouncementNotifications(schoolId, user, db);
    if (!visible.some((item) => Number(item.id) === Number(id))) throw new ApiError(404, "Announcement not found.");
    return announcementModel.markAnnouncementRead(id, schoolId, user.id, db);
};

const markAllAnnouncementsRead = async (schoolId, user, db) => {
    requireSchool(schoolId);
    const visible = await getAnnouncementNotifications(schoolId, user, db);
    return announcementModel.markAllAnnouncementsRead(schoolId, user.id, visible.filter((item) => !item.is_read).map((item) => Number(item.id)), db);
};


const ALLOWED_FILE_TYPES = new Map([
    [".pdf", ["application/pdf"]],
    [".jpg", ["image/jpeg"]],
    [".jpeg", ["image/jpeg"]],
    [".png", ["image/png"]],
    [".txt", ["text/plain"]],
    [".csv", ["text/csv", "application/vnd.ms-excel"]],
    [".doc", ["application/msword"]],
    [".docx", ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]],
    [".xls", ["application/vnd.ms-excel"]],
    [".xlsx", ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]],
    [".ppt", ["application/vnd.ms-powerpoint"]],
    [".pptx", ["application/vnd.openxmlformats-officedocument.presentationml.presentation"]]
]);

const uploadAnnouncementAttachments = async (announcementId, files, schoolId, user, db) => {
    requireSchool(schoolId);
    requireManager(user);
    const announcements = await announcementModel.getAnnouncementsForManagement(schoolId, db);
    if (!announcements.some((item) => Number(item.id) === Number(announcementId))) throw new ApiError(404, "Announcement not found.");
    if (!Array.isArray(files) || files.length === 0) throw new ApiError(400, "Choose at least one file to upload.");
    const existingCount = await announcementModel.countAnnouncementAttachments(announcementId, schoolId, db);
    if (existingCount + files.length > 10) throw new ApiError(400, "An announcement can have at most 10 attachments.");
    const uploaded = [];
    for (const file of files) {
        const fileName = String(file.originalname || "").replace(/[\\r\\n\\0]/g, "").trim().slice(0, 255);
        const extension = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase() : "";
        const allowedMimes = ALLOWED_FILE_TYPES.get(extension);
        if (!fileName || !allowedMimes || !allowedMimes.includes(file.mimetype)) {
            throw new ApiError(400, `File "${fileName || "unnamed"}" has an unsupported type. Use PDF, JPG, PNG, TXT, CSV, Word, Excel or PowerPoint files.`);
        }
        if (!file.buffer || !file.size || file.size > 5 * 1024 * 1024) throw new ApiError(400, "Each attachment must be smaller than or equal to 5 MB.");
        uploaded.push(await announcementModel.createAnnouncementAttachment(announcementId, schoolId, user.id, {
            file_name: fileName, mime_type: file.mimetype, file_size: file.size, file_data: file.buffer
        }, db));
    }
    return uploaded;
};

const getAnnouncementAttachmentForUser = async (announcementId, attachmentId, schoolId, user, db) => {
    requireSchool(schoolId);
    if (canManageAnnouncements(user)) {
        const announcements = await announcementModel.getAnnouncementsForManagement(schoolId, db);
        if (!announcements.some((item) => Number(item.id) === Number(announcementId))) throw new ApiError(404, "Announcement not found.");
    } else {
        const visible = await getAnnouncementNotifications(schoolId, user, db);
        if (!visible.some((item) => Number(item.id) === Number(announcementId))) throw new ApiError(404, "Announcement not found.");
    }
    const attachment = await announcementModel.getAnnouncementAttachment(announcementId, attachmentId, schoolId, db);
    if (!attachment) throw new ApiError(404, "Attachment not found.");
    return attachment;
};

const deleteAnnouncementAttachment = async (announcementId, attachmentId, schoolId, user, db) => {
    requireSchool(schoolId);
    requireManager(user);
    const announcements = await announcementModel.getAnnouncementsForManagement(schoolId, db);
    if (!announcements.some((item) => Number(item.id) === Number(announcementId))) throw new ApiError(404, "Announcement not found.");
    const deleted = await announcementModel.deleteAnnouncementAttachment(announcementId, attachmentId, schoolId, db);
    if (!deleted) throw new ApiError(404, "Attachment not found.");
    return deleted;
};

module.exports = {
    createAnnouncement, getAnnouncements, getAnnouncementNotifications, updateAnnouncement,
    deactivateAnnouncement, markAnnouncementRead, markAllAnnouncementsRead,
    uploadAnnouncementAttachments, getAnnouncementAttachmentForUser, deleteAnnouncementAttachment
};
