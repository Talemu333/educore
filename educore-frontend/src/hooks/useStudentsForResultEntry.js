import { useQuery } from "@tanstack/react-query";

import { getStudentsForResultEntry } from "@/services/resultService";

export function useStudentsForResultEntry(assignmentId) {

    return useQuery({

        queryKey: [

            "results",

            assignmentId

        ],

        queryFn: () =>

            getStudentsForResultEntry(assignmentId),

        enabled: !!assignmentId

    });

}