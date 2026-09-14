const asyncHandler = require("../middlewares/asyncHandler");
const topicService = require("../services/lessonNoteTopicService");

const list = asyncHandler(async (req, res) => {
    const data = await topicService.list(req.query, req.user);
    res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
    const data = await topicService.create(req.body, req.user);
    res.status(201).json({ success: true, message: "Syllabus topic created.", data });
});

const update = asyncHandler(async (req, res) => {
    const data = await topicService.update(req.params.id, req.body, req.user);
    res.json({ success: true, message: "Syllabus topic updated.", data });
});

const remove = asyncHandler(async (req, res) => {
    const data = await topicService.remove(req.params.id, req.user);
    res.json({ success: true, message: "Syllabus topic deleted.", data });
});

module.exports = { list, create, update, remove };
