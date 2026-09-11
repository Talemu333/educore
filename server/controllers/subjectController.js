const subjectService = require("../services/subjectService");
const classSubjectService = require("../services/classSubjectService");
const studentModel = require("../models/studentModel");
const asyncHandler = require("../middlewares/asyncHandler");
const ApiError = require("../utils/ApiError");

const getSchoolId = (req) => req.user?.school_id;
const getDatabase = (req) => req.schoolDatabase;

const getSubjects = asyncHandler(async (req, res) => {
    const subjects = await subjectService.getSubjects(getSchoolId(req), getDatabase(req));
    res.json({ success: true, count: subjects.length, data: subjects });
});

const createSubject = asyncHandler(async (req, res) => {
    const subject = await subjectService.createSubject(req.body, getSchoolId(req), getDatabase(req));
    res.status(201).json({ success: true, message: "Subject created successfully.", data: subject });
});

const getSubjectsByClass = asyncHandler(async (req, res) => {
    const subjects = await subjectService.getSubjectsByClass(
        req.params.classId,
        getSchoolId(req),
        getDatabase(req)
    );
    res.json({ success: true, data: subjects });
});

const getMySubjects = asyncHandler(async (req, res) => {
    const student = await studentModel.getStudentByUserId(req.user.id, getSchoolId(req));
    if (!student) throw new ApiError(404, "Student profile not found.");
    const subjects = await classSubjectService.getClassSubjects(
        student.class_id,
        getSchoolId(req),
        getDatabase(req)
    );
    res.json({
        success: true,
        data: {
            student: {
                id: student.id,
                admission_number: student.admission_number,
                name: [student.surname, student.first_name, student.middle_name].filter(Boolean).join(" "),
                class_id: student.class_id,
                class_name: student.class_name,
                arm_id: student.arm_id,
                arm_name: student.arm_name
            },
            subjects
        }
    });
});

module.exports = { getSubjects, createSubject, getSubjectsByClass, getMySubjects };
