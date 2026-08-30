import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

const fetchTerms = async () => {

    const response = await api.get(
        "/terms"
    );

    return response.data.data;

};

export const useTerms = () => {

    const { user } = useAuth();
    const schoolId = user?.school_id;

    return useQuery({

        queryKey: ["terms", schoolId],

        queryFn: fetchTerms,

        enabled: !!schoolId

    });

};