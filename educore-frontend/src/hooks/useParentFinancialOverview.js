import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

const fetchParentFinancialOverview = async (
    sessionId,
    termId
) => {

    const response = await api.get(
        "/parents/financial-overview",
        {
            params: {
                sessionId,
                termId
            }
        }
    );

    return response.data.data;

};


export const useParentFinancialOverview = (
    sessionId,
    termId
) => {

    return useQuery({

        queryKey: [
            "parent-financial-overview",
            sessionId,
            termId
        ],

        queryFn: () =>
            fetchParentFinancialOverview(
                sessionId,
                termId
            ),

        enabled:
            Boolean(sessionId) &&
            Boolean(termId)

    });

};