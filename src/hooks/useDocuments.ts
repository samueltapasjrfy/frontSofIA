"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/cache";
import { useCallback, useState } from "react";
import { DocumentApi } from "@/api/documentApi";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";

export function useDocuments(initialPage: number = 1, initialLimit: number = 10) {
    const queryClient = useQueryClient();
    const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)
    const [documentParams, setDocumentParams] = useState<DocumentApi.FindDocuments.Params>({
        page: initialPage,
        limit: initialLimit,
        idCompany: user?.companies?.[0]?.id || ''
    });

    // Query for fetching documents list
    const getDocumentsQuery = useQuery({
        queryKey: [QUERY_KEYS.DOCUMENTS, documentParams],
        queryFn: async () => {
            const data = await DocumentApi.findDocuments(documentParams);
            return data.data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 3,
        retryDelay: 1000,
    });

    // Mutation for analyzing documents
    const analyzeDocumentMutation = useMutation({
        mutationFn: async (params: DocumentApi.AnalyzeDocument.Params) => {
            return DocumentApi.analyzeDocument(params);
        },
        onSuccess: () => {
            // Invalidate documents query to refetch the list
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
        },
    });

    // Utility functions
    const changeDocumentFilter = (params: Partial<DocumentApi.FindDocuments.Params>): void => {
        setDocumentParams(prev => ({ ...prev, ...params }));
    };

    const invalidateDocumentsQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
    }, [queryClient]);

    const analyzeDocument = useCallback(async (params: DocumentApi.AnalyzeDocument.Params) => {
        return analyzeDocumentMutation.mutateAsync(params);
    }, [analyzeDocumentMutation]);

    return {
        // Document queries and state
        getDocumentsQuery,
        documentParams,
        changeDocumentFilter,
        invalidateDocumentsQuery,

        // Document mutations
        analyzeDocument,
        analyzeDocumentMutation,
    };
}
