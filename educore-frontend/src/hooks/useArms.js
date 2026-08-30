import { useQuery } from "@tanstack/react-query";
import { getArms } from "@/api/armApi";
import { useAuth } from "@/context/AuthContext";

export function useArms() {

    const { user } = useAuth();
    const schoolId = user?.school_id;

    return useQuery({

        queryKey: ["arms", schoolId],

        queryFn: getArms,

        enabled: !!schoolId

    });

}