import {
    useQuery
} from "@tanstack/react-query";

import {
    getPromotionSetup
} from "@/api/promotionApi";

import toast from "react-hot-toast";


export const usePromotionSetup = () => {

    return useQuery({

        queryKey: [
            "promotion-setup"
        ],

        queryFn: async () => {

            try {

                return await getPromotionSetup();

            } catch (error) {

                const message =
                    error?.response?.data?.message ||
                    error?.userMessage ||
                    "Unable to load promotion information. Please try again.";

                toast.error(message);

                throw error;

            }

        },

        // Configuration errors (4xx) should not be retried. Temporary server
        // or network failures get a small number of retries before the page
        // displays its final error state.
        retry: (failureCount, error) => {

            const status = error?.response?.status;

            if (status >= 400 && status < 500) {
                return false;
            }

            return failureCount < 2;

        }

    });

};
