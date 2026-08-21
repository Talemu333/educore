import { useQuery } from "@tanstack/react-query";

import {
    getStudentAttendance,
    getAttendanceSummary
} from "@/api/attendanceApi";


export const useParentStudentAttendance = ({
    studentId,
    sessionId,
    termId
}) => {

    return useQuery({

        queryKey: [
            "parent-student-attendance",
            studentId,
            sessionId,
            termId
        ],

        queryFn: () =>
            getStudentAttendance({

                studentId,

                sessionId,

                termId

            }),

        enabled:

            Boolean(studentId) &&
            Boolean(sessionId) &&
            Boolean(termId)

    });

};


export const useParentAttendanceSummary = ({
    studentId,
    sessionId,
    termId
}) => {

    return useQuery({

        queryKey: [
            "parent-attendance-summary",
            studentId,
            sessionId,
            termId
        ],

        queryFn: () =>
            getAttendanceSummary({

                studentId,

                sessionId,

                termId

            }),

        enabled:

            Boolean(studentId) &&
            Boolean(sessionId) &&
            Boolean(termId)

    });

};