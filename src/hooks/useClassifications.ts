"use client"
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/cache";
import { useCallback, useRef } from "react";
import { PublicationsApi } from "@/api/publicationsApi";
import { queryClient } from "@/lib/reactQuery";

export function useClassifications(idCaseType?: number) {
    const classificationParams = useRef<PublicationsApi.FindAllClassifications.Params>({
        idCaseType,
    });

    const getClassificationsQuery = useQuery({
        queryKey: [QUERY_KEYS.CLASSIFICATIONS, classificationParams.current],
        queryFn: async () => {
            const params = {
                idCaseType: classificationParams.current.idCaseType,
            }
            const data = await PublicationsApi.findAllClassifications(params);
            return data;
        },
        staleTime: 1000 * 60 * 10, 
        retry: 3,
        retryDelay: 1000,
    });

    const changeFilter = (params: Partial<PublicationsApi.FindAllClassifications.Params>): void => {
        classificationParams.current = { ...classificationParams.current, ...params };
    };

    const invalidateQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLASSIFICATIONS] });
    }, [queryClient]);

    return {
        getClassificationsQuery,
        invalidateQuery,
        changeFilter,
        classificationParams
    }
} 