import {
    useQuery
} from "@tanstack/react-query";

import {
    getPromotionSetup
} from "@/api/promotionApi";


export const usePromotionSetup = () => {

    return useQuery({

        queryKey: [
            "promotion-setup"
        ],

        queryFn:
            getPromotionSetup

    });

};