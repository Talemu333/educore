import {
    useQuery
} from "@tanstack/react-query";

import {
    getAdministrators
} from "@/api/adminApi";


export const useAdministrators = () => {

    return useQuery({

        queryKey: [
            "administrators"
        ],

        queryFn:
            getAdministrators

    });

};