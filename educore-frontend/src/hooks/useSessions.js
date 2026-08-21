import { useQuery } from "@tanstack/react-query";
import { getSessions } from "@/api/sessionApi";

export function useSessions() {

    return useQuery({

        queryKey: ["sessions"],

        queryFn: getSessions

    });

}