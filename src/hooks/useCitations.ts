"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/cache";
import { useCallback, useState } from "react";
import { CitationsApi } from "@/api/citationsApi";
import { toast } from "sonner";

export function useCitations(initialPage: number = 1, initialLimit: number = 10) {
    const [citationParams, setCitationParams] = useState<CitationsApi.FindAll.Params>({
        page: initialPage,
        limit: initialLimit,
    });

    const queryClient = useQueryClient();

    const getCitationsQuery = useQuery({
        queryKey: [QUERY_KEYS.CITATIONS, citationParams],
        queryFn: async () => {
            const params: Record<string, any> = {};
            Object.entries(citationParams).forEach(([key, value]) => {
                if (value) {
                    params[key] = value;
                }
            });

            if ((params.dateStart && !params.dateEnd) || (!params.dateStart && params.dateEnd)) {
                delete params.dateStart;
                delete params.dateEnd;
            }

            console.log({ params });
            const data = await CitationsApi.findAll(params);
            console.log({ data });
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 3,
        retryDelay: 1000,
    });

    const getTotalPendingQuery = useQuery({
        queryKey: [QUERY_KEYS.CITATIONS_TOTAL_PENDING],
        queryFn: async () => {
            const data = await CitationsApi.getTotalPending();
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
        retryDelay: 1000,
    });

    const updateStatusBulkMutation = useMutation({
        mutationFn: async (data: CitationsApi.UpdateStatusBulk.Params) => {
            const response = await CitationsApi.updateStatusBulk(data);
            return response;
        },
        onSuccess: (response) => {
            toast.success(response.data.message);
            // Invalidate citations queries to refresh data
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CITATIONS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESSES] });
            queryClient.refetchQueries({ queryKey: [QUERY_KEYS.CITATIONS_TOTAL_PENDING] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Erro ao atualizar status das citações');
        },
    });

    const changeFilter = (params: Partial<CitationsApi.FindAll.Params>): void => {
        setCitationParams(prev => ({ ...prev, ...params, page: params.page || 1 }));
    };

    const invalidateQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CITATIONS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESSES] });
        queryClient.refetchQueries({ queryKey: [QUERY_KEYS.CITATIONS_TOTAL_PENDING] });
    }, [queryClient]);

    const updateStatusBulk = useCallback((data: CitationsApi.UpdateStatusBulk.Params) => {
        updateStatusBulkMutation.mutate(data);
    }, [updateStatusBulkMutation]);

    return {
        getCitationsQuery,
        getTotalPendingQuery,
        updateStatusBulkMutation,
        updateStatusBulk,
        invalidateQuery,
        changeFilter,
        citationParams
    }
}
