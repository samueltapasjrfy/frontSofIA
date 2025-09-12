"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/cache";
import { useCallback, useState } from "react";
import { AudiencesApi } from "@/api/audiencesApi";
import { toast } from "sonner";

export function useAudiences(initialPage: number = 1, initialLimit: number = 10) {
    const [audienceParams, setAudienceParams] = useState<AudiencesApi.FindAll.Params>({
        page: initialPage,
        limit: initialLimit,
    });

    const queryClient = useQueryClient();

    const getAudiencesQuery = useQuery({
        queryKey: [QUERY_KEYS.AUDIENCES, audienceParams],
        queryFn: async () => {
            const params: Record<string, any> = {};
            Object.entries(audienceParams).forEach(([key, value]) => {
                if (value) {
                    params[key] = value;
                }
            });

            if ((params.dateStart && !params.dateEnd) || (!params.dateStart && params.dateEnd)) {
                delete params.dateStart;
                delete params.dateEnd;
            }

            console.log({ params });
            const data = await AudiencesApi.findAll(params);
            console.log({ data });
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 3,
        retryDelay: 1000,
    });

    const getTotalPendingQuery = useQuery({
        queryKey: [QUERY_KEYS.AUDIENCES_TOTAL_PENDING],
        queryFn: async () => {
            const data = await AudiencesApi.getTotalPending();
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
        retryDelay: 1000,
    });

    const updateStatusBulkMutation = useMutation({
        mutationFn: async (data: AudiencesApi.UpdateStatusBulk.Params) => {
            const response = await AudiencesApi.updateStatusBulk(data);
            return response;
        },
        onSuccess: (response) => {
            toast.success(response.data.message);
            // Invalidate audiences queries to refresh data
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIENCES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESSES] });
            queryClient.refetchQueries({ queryKey: [QUERY_KEYS.AUDIENCES_TOTAL_PENDING] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Erro ao atualizar status das audiências');
        },
    });

    const changeFilter = (params: Partial<AudiencesApi.FindAll.Params>): void => {
        setAudienceParams(prev => ({ ...prev, ...params, page: params.page || 1 }));
    };

    const invalidateQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIENCES] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESSES] });
        queryClient.refetchQueries({ queryKey: [QUERY_KEYS.AUDIENCES_TOTAL_PENDING] });
    }, [queryClient]);

    const updateStatusBulk = useCallback((data: AudiencesApi.UpdateStatusBulk.Params) => {
        updateStatusBulkMutation.mutate(data);
    }, [updateStatusBulkMutation]);

    return {
        getAudiencesQuery,
        getTotalPendingQuery,
        updateStatusBulkMutation,
        updateStatusBulk,
        invalidateQuery,
        changeFilter,
        audienceParams
    }
}
