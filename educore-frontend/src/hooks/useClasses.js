import { useQuery } from "@tanstack/react-query";
import { getClasses } from "@/api/classApi";
import { useAuth } from "@/context/AuthContext";

export function useClasses() {

    const { user } = useAuth();
    const schoolId = user?.school_id;

    return useQuery({

        queryKey: ["classes", schoolId],

        queryFn: getClasses,

        enabled: !!schoolId

    });

}