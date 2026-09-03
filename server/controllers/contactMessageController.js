const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middlewares/asyncHandler");
const publicWebsiteModel = require("../models/publicWebsiteModel");
const contactMessageModel = require("../models/contactMessageModel");

const getPublicSchoolId = async (req) => {
    const schoolSlug = req.query.schoolSlug;

    if (!schoolSlug) {
        throw new ApiError(400, "School website could not be determined.");
    }

    const school = await publicWebsiteModel.getSchoolBySlug(schoolSlug);

    if (!school) {
        throw new ApiError(404, "School website not found.");
    }

    return school.school_id;
};

const createContactMessage = asyncHandler(async (req, res) => {
    const schoolId = await getPublicSchoolId(req);
    const { name, email, phone, subject, message } = req.body || {};

    if (!name?.trim()) {
        throw new ApiError(400, "Full name is required.");
    }

    if (!email?.trim()) {
        throw new ApiError(400, "Email address is required.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw new ApiError(400, "Please provide a valid email address.");
    }

    if (!subject?.trim()) {
        throw new ApiError(400, "Subject is required.");
    }

    if (!message?.trim()) {
        throw new ApiError(400, "Message is required.");
    }

    if (name.trim().length > 150) {
        throw new ApiError(400, "Full name is too long.");
    }

    if (email.trim().length > 150) {
        throw new ApiError(400, "Email address is too long.");
    }

    if (phone && phone.trim().length > 40) {
        throw new ApiError(400, "Phone number is too long.");
    }

    if (subject.trim().length > 200) {
        throw new ApiError(400, "Subject is too long.");
    }

    if (message.trim().length > 5000) {
        throw new ApiError(400, "Message is too long.");
    }

    const contactMessage = await contactMessageModel.createContactMessage(
        {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone?.trim() || null,
            subject: subject.trim(),
            message: message.trim(),
        },
        schoolId
    );

    res.status(201).json({
        success: true,
        message: "Your message has been sent successfully.",
        data: contactMessage,
    });
});

const getContactMessages = asyncHandler(async (req, res) => {
    const schoolId = req.user?.school_id;

    if (!schoolId) {
        throw new ApiError(403, "School context is required.");
    }

    const messages = await contactMessageModel.getContactMessages(schoolId);

    res.json({
        success: true,
        data: messages,
    });
});

const updateContactMessageStatus = asyncHandler(async (req, res) => {
    const schoolId = req.user?.school_id;
    const { status } = req.body || {};

    if (!schoolId) {
        throw new ApiError(403, "School context is required.");
    }

    if (!["unread", "read", "responded"].includes(status)) {
        throw new ApiError(400, "Invalid message status.");
    }

    const updated = await contactMessageModel.updateContactMessageStatus(
        req.params.id,
        status,
        schoolId
    );

    if (!updated) {
        throw new ApiError(404, "Contact message not found.");
    }

    res.json({
        success: true,
        message: "Contact message status updated successfully.",
        data: updated,
    });
});

module.exports = {
    createContactMessage,
    getContactMessages,
    updateContactMessageStatus,
};
