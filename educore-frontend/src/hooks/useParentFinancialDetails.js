import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";


const fetchParentFinancialDetails = async (
    parentId,
    sessionId,
    termId
) => {

    const response = await api.get(
        `/parents/financial-overview/${parentId}/${sessionId}/${termId}`
    );

    return response.data.data;

};


export const useParentFinancialDetails = (
    parentId,
    sessionId,
    termId
) => {

    return useQuery({

        queryKey: [
            "parent-financial-details",
            parentId,
            sessionId,
            termId
        ],

        queryFn: () =>
            fetchParentFinancialDetails(
                parentId,
                sessionId,
                termId
            ),

        enabled:
            Boolean(parentId) &&
            Boolean(sessionId) &&
            Boolean(termId)

    });

};