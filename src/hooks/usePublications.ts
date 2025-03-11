"use client"
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/cache";
import { useCallback, useState } from "react";
import { PublicationsApi } from "@/api/publicationsApi";
import { queryClient } from "@/lib/reactQuery";

export function usePublications(initialPage: number = 1, initialLimit: number = 10) {
    const [publicationParams, setPublicationParams] = useState<PublicationsApi.FindAll.Params>({
        page: initialPage,
        limit: initialLimit,
    });

    const getPublicationsQuery = useQuery({
        queryKey: [QUERY_KEYS.PUBLICATIONS, publicationParams],
        queryFn: async () => {
            const params = {
                page: publicationParams.page,
                limit: publicationParams.limit,
            }
            const data = await PublicationsApi.findAll(params);
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 3,
        retryDelay: 1000,
    });

    const changeFilter = (params: Partial<PublicationsApi.FindAll.Params>): void => {
        setPublicationParams(prev => ({ ...prev, ...params }));
    };

    const invalidateQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PUBLICATIONS] });
    }, []);

    return {
        getPublicationsQuery,
        invalidateQuery,
        changeFilter,
        publicationParams
    }
} 