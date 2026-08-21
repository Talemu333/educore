import { useQuery } from "@tanstack/react-query";

import { getArmsByClass } from "../services/armService";

export function useArmsByClass(classId) {

    return useQuery({

        queryKey: ["arms", classId],

        queryFn: () => getArmsByClass(classId),

        enabled: !!classId

    });

}