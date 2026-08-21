import { useQuery } from "@tanstack/react-query";

import { getNationalities } from "@/api/nationalityApi";

export function useNationalities() {

    return useQuery({

        queryKey: ["nationalities"],

        queryFn: getNationalities

    });

}