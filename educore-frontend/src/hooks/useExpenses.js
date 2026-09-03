import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query";

import {
    getExpenses,
    getExpenseSummary,
    createExpense,
    updateExpense,
    deleteExpense
} from "@/services/expenseService";

export const useExpenses = (filters = {}) => {
    return useQuery({
        queryKey: ["expenses", filters],
        queryFn: () => getExpenses(filters)
    });
};

export const useExpenseSummary = (filters = {}) => {
    return useQuery({
        queryKey: ["expense-summary", {
            dateFrom: filters.dateFrom || "",
            dateTo: filters.dateTo || "",
            category: filters.category || "",
            paymentMethod: filters.paymentMethod || ""
        }],
        queryFn: () => getExpenseSummary(filters)
    });
};

export const useCreateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
        }
    });
};

export const useUpdateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
        }
    });
};

export const useDeleteExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
        }
    });
};
