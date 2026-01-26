"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/cache";
import { useCallback } from "react";
import { OabApi } from "@/api/oabApi";
import { toast } from "sonner";

export function useOabs() {
    const queryClient = useQueryClient();

    const getOabsQuery = useQuery({
        queryKey: [QUERY_KEYS.OABS_V2],
        queryFn: async () => {
            const response = await OabApi.find();
            if (response.error) {
                throw new Error(response.message || 'Erro ao buscar OABs');
            }
            return response.data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 3,
        retryDelay: 1000,
    });

    const saveOabsMutation = useMutation({
        mutationFn: async (params: OabApi.Save.Params) => {
            const response = await OabApi.save(params);
            if (response.error) {
                throw new Error(response.message || 'Erro ao cadastrar OABs');
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OABS_V2] });
            toast.success('OABs cadastradas com sucesso');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Erro ao cadastrar OABs');
        },
    });

    const deleteOabMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await OabApi.delete(id);
            if (response.error) {
                throw new Error(response.message || 'Erro ao deletar OAB');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OABS_V2] });
            toast.success('OAB deletada com sucesso');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Erro ao deletar OAB');
        },
    });

    const invalidateOabsQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OABS_V2] });
    }, [queryClient]);

    return {
        getOabsQuery,
        saveOabsMutation,
        deleteOabMutation,
        invalidateOabsQuery,
    };
}
