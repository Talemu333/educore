const ApiError = require("../utils/ApiError");
const classModel = require("../models/classModel");
const subjectModel = require("../models/subjectModel");
const classSubjectModel = require("../models/classSubjectModel");

const saveClassSubjects = async (data, schoolId, database) => {
    if (!schoolId) {
        throw new ApiError(403, "School context is required.");
    }

    if (!database) {
        throw new ApiError(500, "School database context is unavailable.");
    }

    const schoolClass = await classModel.getClassById(data.class_id, schoolId, database);

    if (!schoolClass) {
        throw new ApiError(404, "Class not found in this school.");
    }

    for (const subject of data.subjects) {
        const existingSubject = await subjectModel.getSubjectById(
            subject.subject_id,
            schoolId,
            database
        );

        if (!existingSubject) {
            throw new ApiError(
                404,
                `Subject ${subject.subject_id} not found in this school.`
            );
        }
    }

    const client = await database.connect();

    try {
        await client.query("BEGIN");

        await classSubjectModel.deleteByClassId(client, data.class_id, schoolId);

        for (const subject of data.subjects) {
            await classSubjectModel.create(
                client,
                {
                    class_id: data.class_id,
                    subject_id: subject.subject_id,
                    is_compulsory: subject.is_compulsory
                },
                schoolId
            );
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }

    return await classSubjectModel.getByClassId(data.class_id, schoolId, database);
};

const getClassSubjects = async (classId, schoolId, database) => {
    if (!schoolId) {
        throw new ApiError(403, "School context is required.");
    }

    if (!database) {
        throw new ApiError(500, "School database context is unavailable.");
    }

    const schoolClass = await classModel.getClassById(classId, schoolId, database);

    if (!schoolClass) {
        throw new ApiError(404, "Class not found in this school.");
    }

    return await classSubjectModel.getByClassId(classId, schoolId, database);
};

module.exports = {
    saveClassSubjects,
    getClassSubjects
};
