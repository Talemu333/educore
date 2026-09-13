const asyncHandler = require("../middlewares/asyncHandler");
const lessonNoteService = require("../services/lessonNoteService");

const list = asyncHandler(async (req, res) => {
    const data = await lessonNoteService.list(req.query, req.user);
    res.json({ success: true, data });
});

const get = asyncHandler(async (req, res) => {
    const data = await lessonNoteService.get(req.params.id, req.user);
    res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
    const data = await lessonNoteService.create(req.body, req.user);
    res.status(201).json({ success: true, message: "Lesson note saved as draft.", data });
});

const update = asyncHandler(async (req, res) => {
    const data = await lessonNoteService.update(req.params.id, req.body, req.user);
    res.json({ success: true, message: "Lesson note updated.", data });
});

const submit = asyncHandler(async (req, res) => {
    const data = await lessonNoteService.submit(req.params.id, req.user);
    res.json({ success: true, message: "Lesson note submitted for review.", data });
});

const review = asyncHandler(async (req, res) => {
    const data = await lessonNoteService.review(req.params.id, req.body.action, req.body.comment, req.user);
    res.json({ success: true, message: req.body.action === "approve" ? "Lesson note approved." : "Lesson note returned to the teacher.", data });
});

const duplicate = asyncHandler(async (req, res) => {
    const data = await lessonNoteService.duplicate(req.params.id, req.user);
    res.status(201).json({ success: true, message: "Lesson note duplicated as a draft.", data });
});

const meta = asyncHandler(async (req, res) => {
    const data = await lessonNoteService.meta(req.user);
    res.json({ success: true, data });
});

module.exports = { list, get, create, update, submit, review, duplicate, meta };
