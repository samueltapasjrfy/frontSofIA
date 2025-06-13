"use client"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "@/constants/cache"
import { PublicationV2Api } from "@/api/publicationV2Api"

export function usePublicationsV2Stats() {
    const getTotalQuery = useQuery({
        queryKey: [QUERY_KEYS.PUBLICATIONS_V2_TOTAL],
        queryFn: async () => {
            const data = await PublicationV2Api.getTotal();
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
        retryDelay: 1000,
    });

    const getStatisticsQuery = useQuery({
        queryKey: [QUERY_KEYS.PUBLICATIONS_V2_STATISTICS],
        queryFn: async () => {
            const data = await PublicationV2Api.getStatistics();
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
        retryDelay: 1000,
    });

    const getProcessingStatusQuery = useQuery({
        queryKey: [QUERY_KEYS.PUBLICATIONS_V2_PROCESSING_STATUS],
        queryFn: async () => {
            const data = await PublicationV2Api.getProcessingStatus();
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
        retryDelay: 1000,
    });

    return {
        // Queries
        getTotalQuery,
        getStatisticsQuery,
        getProcessingStatusQuery,
    }
} 