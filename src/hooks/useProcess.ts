"use client"
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/cache";
import { useCallback, useState } from "react";
import { ProcessApi } from "@/api/processApi";
import { queryClient } from "@/lib/reactQuery";

export function useProcesses(initialPage: number = 1, initialLimit: number = 10) {
    const [processParams, setProcessParams] = useState<ProcessApi.FindAll.Params>({
        page: initialPage,
        limit: initialLimit,
    });

    // Query for fetching processes list
    const getProcessesQuery = useQuery({
        queryKey: [QUERY_KEYS.PROCESSES, processParams],
        queryFn: async () => {
            const data = await ProcessApi.findAll(processParams);
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 3,
        retryDelay: 1000,
    });

    // Query function for fetching a single process
    const getProcess = useCallback((id: string) => {
        return queryClient.fetchQuery({
            queryKey: [QUERY_KEYS.PROCESS, id],
            queryFn: async () => {
                return ProcessApi.findOne(id);
            },
            staleTime: 1000 * 60 * 5, // 5 minutes
        });
    }, []);

    // Query for fetching batches list
    const [batchParams, setBatchParams] = useState<ProcessApi.FindBatches.Params>({
        page: initialPage,
        limit: initialLimit,
    });

    const getBatchesQuery = useQuery({
        queryKey: [QUERY_KEYS.PROCESS_BATCHES, batchParams],
        queryFn: async () => {
            const data = await ProcessApi.findBatches(batchParams);
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 3,
        retryDelay: 1000,
        enabled: false, // Don't fetch immediately, only when needed
    });

    // Query function for fetching a single batch
    const getBatch = useCallback((id: string) => {
        return queryClient.fetchQuery({
            queryKey: [QUERY_KEYS.PROCESS_BATCH, id],
            queryFn: async () => {
                return ProcessApi.findBatch(id);
            },
            staleTime: 1000 * 60 * 5, // 5 minutes
        });
    }, []);

    // Function to handle citation actions
    const handleCitation = useCallback(async (id: string, action: string) => {
        const response = await ProcessApi.handleCitation({ id, action });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESS, id] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESSES] });
        return response;
    }, []);

    // Function to save processes
    const saveProcesses = useCallback(async (data: ProcessApi.Save.Params) => {
        const response = await ProcessApi.save(data);
        if (!response.error) {
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESSES] });
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESS_BATCHES] });
            }, 1000);
        }
        return response;
    }, []);

    const getReport = useQuery({
        queryKey: [QUERY_KEYS.REPORT],
        queryFn: async () => {
            const data = await ProcessApi.report();
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 3,
        retryDelay: 1000,
    });

    const invalidateReport = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORT] });
    }, []);

    // Utility functions
    const changeProcessFilter = (params: Partial<ProcessApi.FindAll.Params>): void => {
        setProcessParams(prev => ({ ...prev, ...params }));
    };

    const changeBatchFilter = (params: Partial<ProcessApi.FindBatches.Params>): void => {
        setBatchParams(prev => ({ ...prev, ...params }));
    };

    const invalidateProcessesQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESSES] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESS] });
    }, []);

    const invalidateBatchesQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESS_BATCHES] });
    }, []);

    const setMonitoring = useCallback(async (id: string, monitoring: boolean) => {
        monitoring ? await ProcessApi.activateMonitoring(id) : await ProcessApi.deactivateMonitoring(id);

        setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESS, id] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESSES] });
        }, 1000);
    }, []);

    const deleteProcess = useCallback(async (id: string) => {
        await ProcessApi.deleteProcess(id);
        invalidateProcessesQuery();
    }, [invalidateProcessesQuery]);

    return {
        // Process queries and state
        getProcessesQuery,
        processParams,
        changeProcessFilter,
        invalidateProcessesQuery,
        getProcess,

        // Batch queries and state
        getBatchesQuery,
        batchParams,
        changeBatchFilter,
        invalidateBatchesQuery,
        getBatch,

        // Action functions
        handleCitation,
        saveProcesses,
        setMonitoring,
        deleteProcess,

        // Report queries and state
        getReport,
        invalidateReport,
    };
}
