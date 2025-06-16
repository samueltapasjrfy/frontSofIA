"use client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "@/constants/cache"
import { PublicationV2Api } from "@/api/publicationV2Api"

export function usePublicationsV2Stats() {
    const queryClient = useQueryClient()

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

    const refetchQueries = () => {
        getTotalQuery.refetch()
        getStatisticsQuery.refetch()
        getProcessingStatusQuery.refetch()
    }

    const invalidateQueries = () => {
        const queries = [
            QUERY_KEYS.PUBLICATIONS_V2_TOTAL,
            QUERY_KEYS.PUBLICATIONS_V2_STATISTICS,
            QUERY_KEYS.PUBLICATIONS_V2_PROCESSING_STATUS
        ]
        queries.forEach(query => {
            queryClient.invalidateQueries({
                queryKey: [query]
            })
        })
    }

    return {
        // Queries
        getTotalQuery,
        getStatisticsQuery,
        getProcessingStatusQuery,
        refetchQueries,
        invalidateQueries,
    }
} 