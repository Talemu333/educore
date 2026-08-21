import { useQuery } from "@tanstack/react-query";
import { getStudentParents } from "@/api/parentApi";

export function useStudentParents(studentId) {

    return useQuery({

        queryKey: ["student-parents", studentId],

        queryFn: () => getStudentParents(studentId),

        enabled: !!studentId

    });

}