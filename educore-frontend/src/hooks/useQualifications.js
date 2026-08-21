import { useQuery } from "@tanstack/react-query";

import { getQualifications } from "@/api/qualificationApi";

export function useQualifications() {

    return useQuery({

        queryKey: ["qualifications"],

        queryFn: getQualifications

    });

}