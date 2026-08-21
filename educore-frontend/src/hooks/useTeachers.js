import { useQuery } from "@tanstack/react-query";
import { getTeachers } from "@/api/teacherApi";

export function useTeachers() {

    return useQuery({

        queryKey: ["teachers"],

        queryFn: getTeachers

    });

}