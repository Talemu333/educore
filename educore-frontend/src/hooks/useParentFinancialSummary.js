import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const fetchParentFinancialSummary = async () => {
    const response = await api.get("/payments/parent-financial-summary");

    return response.data.data;
};

export const useParentFinancialSummary = () => {
    return useQuery({
        queryKey: ["parent-financial-summary"],
        queryFn: fetchParentFinancialSummary
    });
};