import {
    useQuery
} from "@tanstack/react-query";

import {
    getStudentsForPromotion
} from "@/api/promotionApi";


export const usePromotionStudents = ({
    classId,
    armId
}) => {

    return useQuery({

        queryKey: [
            "promotion-students",
            classId,
            armId
        ],

        queryFn: () =>
            getStudentsForPromotion({

                classId,

                armId

            }),

        enabled:
            Boolean(classId)

    });

};