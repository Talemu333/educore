import { useQuery } from "@tanstack/react-query";
import { getParents } from "@/api/parentApi";

export function useParents() {

    return useQuery({

        queryKey: ["parents"],

        queryFn: getParents

    });

}