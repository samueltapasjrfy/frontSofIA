"use client"
import { useQuery, useMutation } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/cache";
import { useCallback, useState } from "react";
import { PublicationV2Api } from "@/api/publicationV2Api";
import { queryClient } from "@/lib/reactQuery";

export function usePublicationsV2(initialPage: number = 1, initialLimit: number = 10) {
    const [publicationParams, setPublicationParams] = useState<PublicationV2Api.FindAll.Params>({
        page: initialPage,
        limit: initialLimit,
    });

    const getPublicationsQuery = useQuery({
        queryKey: [QUERY_KEYS.PUBLICATIONS_V2, publicationParams],
        queryFn: async () => {
            const params: PublicationV2Api.FindAll.Params = {
                page: publicationParams.page,
                limit: publicationParams.limit,
            }
            if (publicationParams.status) {
                params.status = publicationParams.status;
            }
            if (publicationParams.caseType) {
                params.caseType = publicationParams.caseType;
            }
            const data = await PublicationV2Api.findAll(params);
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 3,
        retryDelay: 1000,
    });

    const getPublicationByIdQuery = useCallback((id: string) => {
        return useQuery({
            queryKey: [QUERY_KEYS.PUBLICATION_V2, id],
            queryFn: async () => {
                return await PublicationV2Api.findOne({ id });
            },
            enabled: !!id,
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 2,
        });
    }, []);

    const savePublicationsMutation = useMutation({
        mutationFn: async (data: PublicationV2Api.Save.Params) => {
            return await PublicationV2Api.save(data);
        },
        onSuccess: () => {
            invalidateQuery();
        },
    });

    const changeFilter = useCallback((params: Partial<PublicationV2Api.FindAll.Params>): void => {
        setPublicationParams(prev => ({ ...prev, ...params }));
    }, []);

    const resetFilters = useCallback((): void => {
        setPublicationParams({
            page: 1,
            limit: initialLimit,
        });
    }, [initialLimit]);

    const changePage = useCallback((page: number): void => {
        setPublicationParams(prev => ({ ...prev, page }));
    }, []);

    const changeLimit = useCallback((limit: number): void => {
        setPublicationParams(prev => ({ ...prev, limit, page: 1 }));
    }, []);

    const invalidateQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PUBLICATIONS_V2] });
    }, []);

    const invalidatePublicationById = useCallback((id: string) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PUBLICATION_V2, id] });
    }, []);

    const removePublicationFromCache = useCallback((id: string) => {
        queryClient.removeQueries({ queryKey: [QUERY_KEYS.PUBLICATION_V2, id] });
    }, []);

    const savePublications = useCallback(async (data: PublicationV2Api.Save.Params) => {
        return savePublicationsMutation.mutateAsync(data);
    }, [savePublicationsMutation]);

    return {
        // Queries
        getPublicationsQuery,
        getPublicationByIdQuery,

        // Mutations
        savePublications,
        savePublicationsMutation,

        // Filter management
        changeFilter,
        resetFilters,
        changePage,
        changeLimit,
        publicationParams,

        // Cache management
        invalidateQuery,
        invalidatePublicationById,
        removePublicationFromCache,
    }
}
