import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getTeachers } from "@/api/teacherApi";

export function useTeachers(filters = {}) {
    const {
        search = "",
        departmentId = "",
        status = "",
        page = 1,
        limit = 10
    } = filters;

    return useQuery({
        queryKey: ["teachers", search, departmentId, status, page, limit],
        queryFn: () => getTeachers({ search, departmentId, status, page, limit }),
        placeholderData: keepPreviousData
    });
}
