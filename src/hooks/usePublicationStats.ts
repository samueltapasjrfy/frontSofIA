"use client"
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/cache";
import { useCallback } from "react";
import { PublicationsApi } from "@/api/publicationsApi";
import { queryClient } from "@/lib/reactQuery";

export function usePublicationStats() {
    const getPublicationStatsQuery = useQuery({
        queryKey: [QUERY_KEYS.PUBLICATION_STATS],
        queryFn: async () => {
            const data = await PublicationsApi.getStatusReport();
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
        retryDelay: 1000,
    });

    const invalidateQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PUBLICATION_STATS] });
    }, []);

    return {
        getPublicationStatsQuery,
        invalidateQuery,
    }
} 