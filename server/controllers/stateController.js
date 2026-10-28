const asyncHandler = require("../middlewares/asyncHandler");
const stateService = require("../services/stateService");

const getStates = asyncHandler(async (req, res) => {
    const states = await stateService.getStates();
    res.json({ success: true, data: states });
});

const createState = asyncHandler(async (req, res) => {
    const stateName = typeof req.body.state_name === "string" ? req.body.state_name.trim() : "";
    if (!stateName) {
        return res.status(400).json({ success: false, message: "State name is required." });
    }
    if (stateName.length > 100) {
        return res.status(400).json({ success: false, message: "State name must be 100 characters or fewer." });
    }
    const result = await stateService.createState(stateName);
    if (!result.created) {
        return res.status(409).json({ success: false, message: `“${result.state.state_name}” is already in the states list.`, data: result.state });
    }
    return res.status(201).json({ success: true, message: "State added successfully.", data: result.state });
});

module.exports = { getStates, createState };
