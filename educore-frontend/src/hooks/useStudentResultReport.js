import { useQuery } from "@tanstack/react-query";

import {
    getStudentResultReport
} from "@/services/resultService";

export function useStudentResultReport(

    studentId,

    sessionId,

    termId

) {

    return useQuery({

        queryKey: [

            "student-result-report",

            studentId,

            sessionId,

            termId

        ],

        queryFn: () =>

            getStudentResultReport(

                studentId,

                sessionId,

                termId

            ),

        enabled:

            !!studentId &&

            !!sessionId &&

            !!termId

    });

}