"use client"
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/cache";
import { useCallback, useState } from "react";
import { BatchApi } from "@/api/batchApi";
import { queryClient } from "@/lib/reactQuery";

export function useBatch(initialPage: number = 1, initialLimit: number = 10) {
    const [batchParams, setBatchParams] = useState<BatchApi.FindAll.Params>({
        page: initialPage,
        limit: initialLimit,
    });

    // Query for fetching batches list
    const getBatchesQuery = useQuery({
        queryKey: [QUERY_KEYS.BATCHES, batchParams],
        queryFn: async () => {
            const data = await BatchApi.findAll(batchParams);
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 3,
        retryDelay: 1000,
    });

    // Query function for fetching a single batch
    const getBatch = useCallback((id: string) => {
        return queryClient.fetchQuery({
            queryKey: [QUERY_KEYS.BATCH, id],
            queryFn: async () => {
                return BatchApi.findOne(id);
            },
            staleTime: 1000 * 60 * 5, // 5 minutes
        });
    }, []);

    // Utility functions
    const changeBatchFilter = (params: Partial<BatchApi.FindAll.Params>): void => {
        setBatchParams(prev => ({ ...prev, ...params }));
    };

    const invalidateBatchesQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCHES] });
    }, []);

    const invalidateBatchQuery = useCallback((id: string) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH, id] });
    }, []);

    return {
        // Batch queries and state
        getBatchesQuery,
        batchParams,
        changeBatchFilter,
        invalidateBatchesQuery,
        invalidateBatchQuery,
        getBatch,
    };
}
