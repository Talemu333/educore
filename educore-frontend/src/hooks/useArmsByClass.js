import { useQuery } from "@tanstack/react-query";

import { getArmsByClass } from "../services/armService";
import { useAuth } from "@/context/AuthContext";

export function useArmsByClass(classId) {

    const { user } = useAuth();
    const schoolId = user?.school_id;

    return useQuery({

        queryKey: ["arms", schoolId, classId],

        queryFn: () => getArmsByClass(classId),

        enabled: !!schoolId && !!classId

    });

}