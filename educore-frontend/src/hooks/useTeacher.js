import { useQuery } from "@tanstack/react-query";
import { getTeacherById } from "@/api/teacherApi";

export function useTeacher(id, enabled = true) {

    return useQuery({

        queryKey: ["teacher", id],

        queryFn: () => getTeacherById(id),

        enabled: !!id && enabled

    });

}