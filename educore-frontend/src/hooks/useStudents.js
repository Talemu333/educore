import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { getStudents } from "../services/studentService";

export function useStudents(search = "", page = 1, limit = 10, classId = "", includeInactive = false) {
    return useQuery({
        queryKey: ["students", search, page, limit, classId, includeInactive],
        queryFn: () => getStudents(search, page, limit, classId, includeInactive),
        placeholderData: keepPreviousData
    });
}
