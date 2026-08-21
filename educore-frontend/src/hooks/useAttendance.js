import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query";


import {
    saveAttendance,
    getAttendanceByDate,
    getStudentAttendance,
    getAttendanceSummary,
    getStudentsForAttendance,
    getTeacherAttendanceStudents,
    getAttendanceByAssignment
} from "@/api/attendanceApi";


/*
=========================================
GET STUDENTS FOR ATTENDANCE
=========================================
*/

export function useStudentsForAttendance({

    sessionId,

    classId,

    armId

}) {

    return useQuery({

        queryKey: [

            "attendance-students",

            sessionId,

            classId,

            armId

        ],

        queryFn: () =>

            getStudentsForAttendance({

                sessionId,

                classId,

                armId

            }),

        enabled:

            !!sessionId &&

            !!classId

    });

}


/*
=========================================
GET ATTENDANCE BY DATE
=========================================
*/

export function useAttendanceByDate({

    classId,

    armId,

    attendanceDate

}) {

    return useQuery({

        queryKey: [

            "attendance",

            classId,

            armId,

            attendanceDate

        ],

        queryFn: () =>

            getAttendanceByDate({

                classId,

                armId,

                attendanceDate

            }),

        enabled:

            !!classId &&

            !!attendanceDate

    });

}


/*
=========================================
SAVE ATTENDANCE
=========================================
*/

export function useSaveAttendance() {

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:
            saveAttendance,


        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "attendance"
                ]

            });

        }

    });

}


/*
=========================================
GET STUDENT ATTENDANCE
=========================================
*/

export function useStudentAttendance(
    studentId
) {

    return useQuery({

        queryKey: [

            "student-attendance",

            studentId

        ],

        queryFn: () =>

            getStudentAttendance(
                studentId
            ),

        enabled:
            !!studentId

    });

}


/*
=========================================
GET ATTENDANCE SUMMARY
=========================================
*/

export function useAttendanceSummary(
    studentId
) {

    return useQuery({

        queryKey: [

            "attendance-summary",

            studentId

        ],

        queryFn: () =>

            getAttendanceSummary(
                studentId
            ),

        enabled:
            !!studentId

    });

}

export function useTeacherAttendanceStudents(
    assignmentId
) {

    return useQuery({

        queryKey: [
            "teacher-attendance-students",
            assignmentId
        ],

        queryFn: () =>
            getTeacherAttendanceStudents(
                assignmentId
            ),

        enabled:
            !!assignmentId

    });

}

export function useAttendanceByAssignment({

    assignmentId,
    attendanceDate

}) {

    return useQuery({

        queryKey: [

            "attendance-by-assignment",

            assignmentId,

            attendanceDate

        ],

        queryFn: () =>
            getAttendanceByAssignment(

                assignmentId,

                attendanceDate

            ),

        enabled:

            !!assignmentId &&

            !!attendanceDate

    });

}