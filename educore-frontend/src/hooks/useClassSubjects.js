import { useQuery } from "@tanstack/react-query";

import { getClassSubjects } from "@/api/classSubjectApi";

export function useClassSubjects(classId) {

    return useQuery({

        queryKey: [

            "classSubjects",

            classId

        ],

        queryFn: () => getClassSubjects(classId),

        enabled: !!classId

    });

}