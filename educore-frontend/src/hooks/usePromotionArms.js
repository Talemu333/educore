import {
    useQuery
} from "@tanstack/react-query";

import {
    getArmsByClass
} from "@/api/promotionApi";


export const usePromotionArms = (
    classId
) => {

    return useQuery({

        queryKey: [
            "promotion-arms",
            classId
        ],

        queryFn: () =>
            getArmsByClass(
                classId
            ),

        enabled:
            Boolean(classId)

    });

};