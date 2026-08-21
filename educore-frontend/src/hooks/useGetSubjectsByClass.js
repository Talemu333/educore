import { useQuery } from "@tanstack/react-query";

import {

    getSubjectsByClass

} from "@/api/subjectApi";

export function useClassSubjects(classId) {

    return useQuery({

        queryKey: [

            "class-subjects",

            classId

        ],

        queryFn: () =>

            getSubjectsByClass(classId),

        enabled: !!classId

    });

}