import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

const fetchDashboard = async () => {
    const response = await api.get("/dashboard");

    return response.data.data;
};

export const useDashboard = () => {

    return useQuery({
        queryKey: ["dashboard"],
        queryFn: fetchDashboard,
    });

};