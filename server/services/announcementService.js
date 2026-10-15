const announcementModel = require("../models/announcementModel");
const ApiError = require("../utils/ApiError");

const ALLOWED_AUDIENCES = new Set(["all", "students", "teachers", "parents", "administrators"]);
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

    if (!title) throw new ApiError(400, "Announcement title is required.");
    if (title.length > 200) throw new ApiError(400, "Announcement title must be 200 characters or fewer.");
    if (!message) throw new ApiError(400, "Announcement message is required.");
    if (!ALLOWED_AUDIENCES.has(audience)) throw new ApiError(400, "Please select a valid announcement audience.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(publishDate))) throw new ApiError(400, "A valid publication date is required.");
    if (expiryDate && !/^\d{4}-\d{2}-\d{2}$/.test(String(expiryDate))) throw new ApiError(400, "Please provide a valid expiry date.");
    if (expiryDate && expiryDate < publishDate) throw new ApiError(400, "The expiry date cannot be earlier than the publication date.");
    if (typeof isActive !== "boolean") throw new ApiError(400, "Announcement status must be active or inactive.");

    return { title, message, audience, publish_date: publishDate, expiry_date: expiryDate, is_active: isActive };
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
    if (!canManageAnnouncements(user)) {
        throw new ApiError(403, "You do not have permission to manage announcements.");
    }
};

const createAnnouncement = async (data, schoolId, user, db) => {
    requireSchool(schoolId);
    requireManager(user);
    return announcementModel.createAnnouncement(
        { ...normalizeAnnouncement(data), created_by: user.id },
        schoolId,
        db
    );
};

const getAnnouncements = async (schoolId, user, db) => {
    requireSchool(schoolId);
    if (canManageAnnouncements(user)) return announcementModel.getAnnouncementsForManagement(schoolId, db);
    return announcementModel.getAnnouncementsForAudience(schoolId, getAudienceForUser(user), db);
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

module.exports = { createAnnouncement, getAnnouncements, updateAnnouncement, deactivateAnnouncement };
