import { useQuery } from "@tanstack/react-query";
import { getRelationships } from "@/api/relationshipApi";

export function useRelationships() {

    return useQuery({

        queryKey: ["relationships"],

        queryFn: getRelationships

    });

}