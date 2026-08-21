import { useQuery } from "@tanstack/react-query";

import { getStates } from "@/api/stateApi";

export function useStates() {

    return useQuery({

        queryKey: ["states"],

        queryFn: getStates

    });

}