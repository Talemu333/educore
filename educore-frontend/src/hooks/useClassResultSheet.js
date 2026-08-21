import { useQuery } from "@tanstack/react-query";

import {
    getClassResultSheet
} from "@/services/resultService";

export function useClassResultSheet(
    classId,
    armId,
    sessionId,
    termId
) {

    return useQuery({

        queryKey: [
            "classResultSheet",
            classId,
            armId,
            sessionId,
            termId
        ],

        queryFn: () =>
            getClassResultSheet(
                classId,
                armId,
                sessionId,
                termId
            ),

        enabled: Boolean(
            classId &&
            armId &&
            sessionId &&
            termId
        )

    });

}