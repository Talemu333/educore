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

                // Keep configuration/server errors visible long enough for the
                // user to read them while the page shows its error state.
                toast.error(message, {
                    id: "promotion-setup-error",
                    duration: 10000
                });

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
