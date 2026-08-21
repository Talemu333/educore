import { useQuery } from "@tanstack/react-query";

import { getTeacherAssignments } from "@/api/teacherAssignmentApi";

export function useTeacherAssignments(teacherId) {

    return useQuery({

        queryKey: ["teacherAssignments", teacherId],

        queryFn: () => getTeacherAssignments(teacherId),

        enabled: !!teacherId

    });

}