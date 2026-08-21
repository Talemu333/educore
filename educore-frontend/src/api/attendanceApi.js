import api from "./axios";


/*
=========================================
SAVE ATTENDANCE
=========================================

This handles BOTH:

1. Creating new attendance
2. Updating existing attendance

The backend uses UPSERT to determine
whether to INSERT or UPDATE.
=========================================
*/

export const saveAttendance = async (
    data
) => {

    const response =
        await api.post(
            "/attendance",
            data
        );


    return response.data.data;

};


/*
=========================================
GET ATTENDANCE BY DATE
=========================================
*/

export const getAttendanceByDate = async ({

    classId,

    armId,

    attendanceDate

}) => {

    const response =
        await api.get(

            "/attendance",

            {

                params: {

                    class_id:
                        classId,

                    arm_id:
                        armId || null,

                    attendance_date:
                        attendanceDate

                }

            }

        );


    return response.data.data;

};


/*
=========================================
GET STUDENT ATTENDANCE
=========================================
*/

export const getStudentAttendance = async ({
    studentId,
    sessionId,
    termId
}) => {

    const response =
        await api.get(

            `/attendance/student/${studentId}`,

            {
                params: {

                    session_id:
                        sessionId,

                    term_id:
                        termId

                }

            }

        );


    return response.data.data;

};


/*
=========================================
GET ATTENDANCE SUMMARY
=========================================
*/

export const getAttendanceSummary = async ({
    studentId,
    sessionId,
    termId
}) => {

    const response =
        await api.get(

            `/attendance/student/${studentId}/summary`,

            {
                params: {

                    session_id:
                        sessionId,

                    term_id:
                        termId

                }

            }

        );


    return response.data.data;

};


/*
=========================================
GET STUDENTS FOR ATTENDANCE
=========================================
*/

export const getStudentsForAttendance =
    async ({

        sessionId,

        classId,

        armId

    }) => {

        const response =
            await api.get(

                "/attendance/students",

                {

                    params: {

                        session_id:
                            sessionId,

                        class_id:
                            classId,

                        arm_id:
                            armId || null

                    }

                }

            );


        return response.data.data;

    };

export const getTeacherAttendanceStudents =
async (assignmentId) => {

    const response =
        await api.get(

            `/attendance/assignment/${assignmentId}/students`

        );

    return response.data.data;

};

export const getAttendanceByAssignment =
async (
    assignmentId,
    attendanceDate
) => {

    const response =
        await api.get(

            `/attendance/assignment/${assignmentId}`,

            {
                params: {
                    attendance_date:
                        attendanceDate
                }
            }

        );

    return response.data.data;

};