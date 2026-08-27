const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
const classModel = require("../models/classModel");
const subjectModel = require("../models/subjectModel");
const classSubjectModel = require("../models/classSubjectModel");

const saveClassSubjects = async (data, schoolId) => {
    const schoolClass = await classModel.getClassById(data.class_id, schoolId);

    if (!schoolClass) {
        throw new ApiError(404, "Class not found in this school.");
    }

    for (const subject of data.subjects) {
        const existingSubject = await subjectModel.getSubjectById(
            subject.subject_id,
            schoolId
        );

        if (!existingSubject) {
            throw new ApiError(
                404,
                `Subject ${subject.subject_id} not found in this school.`
            );
        }
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await classSubjectModel.deleteByClassId(client, data.class_id);

        for (const subject of data.subjects) {
            await classSubjectModel.create(client, {
                class_id: data.class_id,
                subject_id: subject.subject_id,
                is_compulsory: subject.is_compulsory
            });
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }

    return await classSubjectModel.getByClassId(data.class_id, schoolId);
};

const getClassSubjects = async (classId, schoolId) => {
    const schoolClass = await classModel.getClassById(classId, schoolId);

    if (!schoolClass) {
        throw new ApiError(404, "Class not found in this school.");
    }

    return await classSubjectModel.getByClassId(classId, schoolId);
};

module.exports = {
    saveClassSubjects,
    getClassSubjects
};
