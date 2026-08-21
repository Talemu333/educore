import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";


const fetchTerms = async () => {

    const response = await api.get(
        "/terms"
    );

    return response.data.data;

};


export const useTerms = () => {

    return useQuery({

        queryKey: ["terms"],

        queryFn: fetchTerms

    });

};