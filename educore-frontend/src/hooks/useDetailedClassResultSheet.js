import { useQuery } from "@tanstack/react-query";

import {
    getDetailedClassResultSheet
} from "@/services/resultService";


export function useDetailedClassResultSheet({

    classId,

    armId,

    sessionId,

    termId

}) {

    return useQuery({

        queryKey: [

            "detailed-class-result-sheet",

            classId,

            armId,

            sessionId,

            termId

        ],

        queryFn: () =>

            getDetailedClassResultSheet({

                classId,

                armId,

                sessionId,

                termId

            }),

        enabled:

            Boolean(

                classId &&

                armId &&

                sessionId &&

                termId

            )

    });

}