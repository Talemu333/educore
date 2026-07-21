const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
const sessionModel = require("../models/sessionModel");
const classModel = require("../models/classModel");
const studentModel = require("../models/studentModel");
const studentEnrollmentModel = require("../models/studentEnrollmentModel");

const promoteStudents = async (data) => {

    const currentSession =
        await sessionModel.getSessionById(data.current_session_id);

    if (!currentSession) {
        throw new ApiError(404, "Current academic session not found.");
    }

    const nextSession =
        await sessionModel.getSessionById(data.next_session_id);

    if (!nextSession) {
        throw new ApiError(404, "Next academic session not found.");
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        for (const item of data.students) {

            const student =
                await studentModel.getStudentById(item.student_id);

            if (!student) {
                throw new ApiError(
                    404,
                    `Student with ID ${item.student_id} not found.`
                );
            }

            const nextClass =
                await classModel.getClassById(item.next_class_id);

            if (!nextClass) {
                throw new ApiError(
                    404,
                    `Destination class not found for student ${item.student_id}.`
                );
            }

            const exists =
                await studentEnrollmentModel.enrollmentExists(
                    item.student_id,
                    data.next_session_id
                );

            if (exists) {
                throw new ApiError(
                    409,
                    `${student.first_name} ${student.surname} already has an enrollment for this session.`
                );
            }

            await studentEnrollmentModel.createEnrollment({

                student_id: item.student_id,

                session_id: data.next_session_id,

                class_id: item.next_class_id,

                arm_id: item.next_arm_id,

                enrollment_status: item.status

            }, client);

            await studentModel.updateCurrentClass(

                item.student_id,

                item.next_class_id,

                item.next_arm_id,

                client

            );

        }

        await client.query("COMMIT");

        return {

            promoted_students: data.students.length,

            session: nextSession.session_name

        };

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }

};

module.exports = {
    promoteStudents
}