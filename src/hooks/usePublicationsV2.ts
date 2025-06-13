"use client"
import { useQuery, useMutation } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/cache";
import { useCallback, useState, useEffect } from "react";
import { PublicationV2Api } from "@/api/publicationV2Api";
import { queryClient } from "@/lib/reactQuery";

export function usePublicationsV2(initialPage: number = 1, initialLimit: number = 10) {
    const [publicationParams, setPublicationParams] = useState<PublicationV2Api.FindAll.Params>({
        page: initialPage,
        limit: initialLimit,
    });

    const [caseTypesParams, setCaseTypesParams] = useState<PublicationV2Api.FindCaseTypes.Params>({
        lastId: 0,
        limit: initialLimit,
    });

    const [classificationsParams, setClassificationsParams] = useState<PublicationV2Api.FindClassifications.Params>({
        lastId: 0,
        limit: initialLimit,
    });

    const [recipientsParams, setRecipientsParams] = useState<PublicationV2Api.FindRecipients.Params>({
        lastId: 0,
        limit: initialLimit,
    });

    const handlePublicationParams = (params: PublicationV2Api.FindAll.Params) => {
        Object.keys(params).forEach((key) => {
            const value = params[key as keyof typeof params];
            if (Array.isArray(value)) {
                value.sort((a, b) => a - b);
            }
        });
        return params;
    }

    const getPublicationsQuery = useQuery({
        queryKey: [
            QUERY_KEYS.PUBLICATIONS_V2,
            { ...handlePublicationParams(publicationParams) }
        ],
        queryFn: async () => {
            const data = await PublicationV2Api.findAll(publicationParams);
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 3,
        retryDelay: 1000,
    });
    // const getPublicationByIdQuery = useCallback((id: string) => {
    //     return useQuery({
    //         queryKey: [QUERY_KEYS.PUBLICATION_V2, id],
    //         queryFn: async () => {
    //             return await PublicationV2Api.findOne({ id });
    //         },
    //         enabled: !!id,
    //         staleTime: 1000 * 60 * 5, // 5 minutes
    //         retry: 2,
    //     });
    // }, []);

    const getCaseTypesQuery = useQuery({
        queryKey: [QUERY_KEYS.CASE_TYPES_V2, caseTypesParams],
        queryFn: async () => {
            const data = await PublicationV2Api.findCaseTypes(caseTypesParams);
            return data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        retry: 3,
        retryDelay: 1000,
    });

    const getClassificationsQuery = useQuery({
        queryKey: [QUERY_KEYS.CLASSIFICATIONS_V2, classificationsParams],
        queryFn: async () => {
            const data = await PublicationV2Api.findClassifications(classificationsParams);
            return data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        retry: 3,
        retryDelay: 1000,
    });

    const getRecipientsQuery = useQuery({
        queryKey: [QUERY_KEYS.RECIPIENTS_V2, recipientsParams],
        queryFn: async () => {
            const data = await PublicationV2Api.findRecipients(recipientsParams);
            return data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        retry: 3,
        retryDelay: 1000,
    });

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

    const changeCaseTypesFilter = useCallback((params: Partial<PublicationV2Api.FindCaseTypes.Params>): void => {
        setCaseTypesParams(prev => ({ ...prev, ...params }));
    }, []);

    const changeClassificationsFilter = useCallback((params: Partial<PublicationV2Api.FindClassifications.Params>): void => {
        setClassificationsParams(prev => ({ ...prev, ...params }));
    }, []);

    const changeRecipientsFilter = useCallback((params: Partial<PublicationV2Api.FindRecipients.Params>): void => {
        setRecipientsParams(prev => ({ ...prev, ...params }));
    }, []);

    const resetFilters = useCallback((): void => {
        setPublicationParams({
            page: 1,
            limit: initialLimit,
        });
        setCaseTypesParams({
            lastId: 0,
            limit: initialLimit,
        });
        setClassificationsParams({
            lastId: 0,
            limit: initialLimit,
        });
        setRecipientsParams({
            lastId: 0,
            limit: initialLimit,
        });
    }, [initialLimit]);

    const changePage = useCallback((page: number): void => {
        console.log("changePage called with:", { page });
        setPublicationParams(prev => {
            const newParams = { ...prev, page };
            console.log("Updating params from:", prev, "to:", newParams);
            return newParams;
        });
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
        getCaseTypesQuery,
        getClassificationsQuery,
        getRecipientsQuery,

        // Mutations
        savePublications,
        savePublicationsMutation,

        // Filter management
        changeFilter,
        changeCaseTypesFilter,
        changeClassificationsFilter,
        changeRecipientsFilter,
        resetFilters,
        changePage,
        changeLimit,
        publicationParams,
        caseTypesParams,
        classificationsParams,
        recipientsParams,

        // Cache management
        invalidateQuery,
        invalidatePublicationById,
        removePublicationFromCache,
    }
}
