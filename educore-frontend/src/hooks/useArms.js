import { useQuery } from "@tanstack/react-query";
import { getArms } from "@/api/armApi";

export function useArms() {

    return useQuery({

        queryKey: ["arms"],

        queryFn: getArms

    });

}