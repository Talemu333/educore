import { useQuery } from "@tanstack/react-query";

import {
    getPromotionHistory
} from "@/api/promotionApi";


/*
=========================================
FETCH PROMOTION HISTORY
=========================================
*/

const fetchPromotionHistory = async ({
    page = 1,
    limit = 20,
    search = "",
    action = ""
}) => {

    return await getPromotionHistory({

        page,

        limit,

        search,

        action

    });

};


/*
=========================================
PROMOTION HISTORY HOOK
=========================================
*/

export const usePromotionHistory = ({
    page = 1,
    limit = 20,
    search = "",
    action = ""
} = {}) => {

    return useQuery({

        queryKey: [
            "promotion-history",
            page,
            limit,
            search,
            action
        ],

        queryFn: () =>
            fetchPromotionHistory({

                page,

                limit,

                search,

                action

            }),

        placeholderData:
            previousData =>
                previousData

    });

};