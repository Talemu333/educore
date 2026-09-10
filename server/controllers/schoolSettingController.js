const schoolSettingsService = require("../services/schoolSettingService");
const schoolSettingsModel = require("../models/schoolSettingModel");
const websiteService = require("../services/websiteService");
const asyncHandler = require("../middlewares/asyncHandler");

const getSchoolSettings = asyncHandler(async (req, res) => {
    let settings;

    if (req.query.schoolSlug) {
        settings = await schoolSettingsModel.getSchoolSettingsBySlug(req.query.schoolSlug);
    } else if (req.query.schoolDomain) {
        const schoolId = await websiteService.resolveDomain(req.query.schoolDomain);
        settings = await schoolSettingsModel.getSchoolSettings(schoolId);
    } else {
        settings = await schoolSettingsService.getSchoolSettings(req.user.school_id);
    }

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
