import { useQuery } from "@tanstack/react-query";
import { getSessions } from "@/api/sessionApi";
import { useAuth } from "@/context/AuthContext";

export function useSessions() {

    const { user } = useAuth();
    const schoolId = user?.school_id;

    return useQuery({

        queryKey: ["sessions", schoolId],

        queryFn: getSessions,

        enabled: !!schoolId

    });

}