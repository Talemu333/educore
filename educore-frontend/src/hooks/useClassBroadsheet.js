import { useQuery } from "@tanstack/react-query";

import {
    getClassBroadsheet
} from "@/services/broadsheetService";


export function useClassBroadsheet(
    classId,
    armId,
    sessionId,
    termId
) {

    return useQuery({

        queryKey: [
            "class-broadsheet",
            classId,
            armId,
            sessionId,
            termId
        ],

        queryFn: () =>
            getClassBroadsheet({
                classId,
                armId,
                sessionId,
                termId
            }),

        enabled:

            !!classId &&

            !!sessionId &&

            !!termId

    });

}