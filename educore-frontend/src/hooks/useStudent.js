import { useQuery } from "@tanstack/react-query";

import { getStudentById, getStudent } from "../services/studentService";

export function useStudent(id) {

    return useQuery({

        queryKey: ["student", id],

        queryFn: () => getStudent(id),

        enabled: !!id

    });

}