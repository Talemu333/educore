import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { getStudents } from "../services/studentService";

export function useStudents(search = "", page = 1, limit = 10) {
    return useQuery({
        queryKey: ["students", search, page, limit],
        queryFn: () => getStudents(search, page, limit),
        placeholderData: keepPreviousData
    });
}
