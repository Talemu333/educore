import { useQuery } from "@tanstack/react-query";

import {

    getGradingScales

} from "@/api/gradingScaleApi";


export function useGradingScales() {

    return useQuery({

        queryKey: [

            "gradingScales"

        ],

        queryFn:

            getGradingScales

    });

}