const pool = require("../config/database");
const ApiError = require("../utils/ApiError");

const classModel = require("../models/classModel");

const subjectModel = require("../models/subjectModel");

const classSubjectModel = require("../models/classSubjectModel");

const saveClassSubjects = async (data) => {

    const schoolClass = await classModel.getClassById(

        data.class_id

    );

    if (!schoolClass) {

        throw new ApiError(

            404,

            "Class not found."

        );

    }

    for (const subject of data.subjects) {

        const existingSubject =

            await subjectModel.getSubjectById(

                subject.subject_id

            );

        if (!existingSubject) {

            throw new ApiError(

                404,

                `Subject ${subject.subject_id} not found.`

            );

        }

    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        await classSubjectModel.deleteByClassId(

            client,

            data.class_id

        );

        for (const subject of data.subjects) {

            await classSubjectModel.create(

                client,

                {

                    class_id: data.class_id,

                    subject_id: subject.subject_id,

                    is_compulsory: subject.is_compulsory

                }

            );

        }

        await client.query("COMMIT");

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }
    return await classSubjectModel.getByClassId(

        data.class_id

    );

};

const getClassSubjects = async (classId) => {

    return await classSubjectModel.getByClassId(

        classId

    );

};

module.exports = {

    saveClassSubjects,

    getClassSubjects

};