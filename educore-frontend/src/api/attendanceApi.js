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
    return saveAttendanceOfflineAware(data);
};


/*
=========================================
GET ATTENDANCE BY DATE
=========================================
*/

export const getAttendanceByDate = async ({
    sessionId,
    termId,
    classId,
    armId,
    attendanceDate
}) => {
    try {
        const response = await api.get(
            "/attendance",
            {
                params: {
                    session_id: sessionId,
                    term_id: termId,
                    class_id: classId,
                    arm_id: armId || null,
                    attendance_date: attendanceDate
                }
            }
        );

        const data = response.data.data;
        const user = await getOfflineUser();

        await cacheAttendanceByDate({
            schoolId: user?.school_id,
            sessionId,
            termId,
            classId,
            armId,
            attendanceDate,
            attendance: data
        }).catch(() => {});

        return data;
    } catch (error) {
        if (!error?.isNetworkError && error?.response?.status !== 0) {
            throw error;
        }

        const user = await getOfflineUser();
        const cached = await getCachedAttendanceByDate({
            schoolId: user?.school_id,
            sessionId,
            termId,
            classId,
            armId,
            attendanceDate
        });

        if (cached === null) throw error;

        return cached;
    }
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
        try {
            const response = await api.get(
                "/attendance/students",
                {
                    params: {
                        session_id: sessionId,
                        class_id: classId,
                        arm_id: armId || null
                    }
                }
            );

            const data = response.data.data;
            const user = await getOfflineUser();

            await cacheAttendanceStudents({
                schoolId: user?.school_id,
                sessionId,
                classId,
                armId,
                students: data
            }).catch(() => {});

            return data;
        } catch (error) {
            if (!error?.isNetworkError && error?.response?.status !== 0) {
                throw error;
            }

            const user = await getOfflineUser();
            const cached = await getCachedAttendanceStudents({
                schoolId: user?.school_id,
                sessionId,
                classId,
                armId
            });

            if (cached === null) throw error;

            return cached;
        }
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