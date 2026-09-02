const schoolSettingsService = require("../services/schoolSettingService");
const schoolSettingsModel = require("../models/schoolSettingModel");
const asyncHandler = require("../middlewares/asyncHandler");

const getSchoolSettings = asyncHandler(async (req, res) => {
    const settings = req.query.schoolSlug
        ? await schoolSettingsModel.getSchoolSettingsBySlug(req.query.schoolSlug)
        : await schoolSettingsService.getSchoolSettings(req.user.school_id);

    if (!settings) {
        return res.status(404).json({
            success: false,
            message: "School settings not found."
        });
    }

    res.json({ success: true, data: settings });
});

const updateSchoolSettings = asyncHandler(async (req, res) => {
    const settings = await schoolSettingsService.updateSchoolSettings(
        req.body,
        req.user.school_id
    );

    res.json({
        success: true,
        message: "School settings updated successfully.",
        data: settings
    });
});

module.exports = { getSchoolSettings, updateSchoolSettings };
