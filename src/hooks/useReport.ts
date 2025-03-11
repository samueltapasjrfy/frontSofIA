"use client"
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/cache";
import { useState, useCallback } from "react";
import { ReportApi } from "@/api/reportApi";
import { queryClient } from "@/lib/reactQuery";

export function useReport(initialOrganizationId: string = "") {
    const [reportParams, setReportParams] = useState<ReportApi.GetResume.Params>({
        idOrganization: initialOrganizationId,
    });

    const getReportQuery = useQuery({
        queryKey: [QUERY_KEYS.REPORT_RESUME, reportParams],
        queryFn: async () => {
            const data = await ReportApi.getResume(reportParams);
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 3,
        retryDelay: 1000,
    });

    const getClassificationConfidenceQuery = useQuery({
        queryKey: [QUERY_KEYS.CLASSIFICATION_CONFIDENCE, reportParams],
        queryFn: async () => {
            const data = await ReportApi.getClassificationConfidence({
                idOrganization: reportParams.idOrganization
            });
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 3,
        retryDelay: 1000,
    });

    const getClassificationPercentageQuery = useQuery({
        queryKey: [QUERY_KEYS.CLASSIFICATION_PERCENTAGE, reportParams],
        queryFn: async () => {
            const data = await ReportApi.getClassificationPercentage({
                idOrganization: reportParams.idOrganization
            });
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 3,
        retryDelay: 1000,
    });

    const changeOrganization = useCallback((organizationId: string): void => {
        setReportParams(prev => ({
            ...prev,
            idOrganization: organizationId,
        }));
    }, []);

    const refreshReport = useCallback((): void => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.REPORT_RESUME, reportParams],
        });
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.CLASSIFICATION_CONFIDENCE, reportParams],
        });
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.CLASSIFICATION_PERCENTAGE, reportParams],
        });
    }, [reportParams]);

    return {
        report: getReportQuery.data?.data,
        isLoading: getReportQuery.isLoading || getClassificationConfidenceQuery.isLoading || getClassificationPercentageQuery.isLoading,
        error: getReportQuery.error || getClassificationConfidenceQuery.error || getClassificationPercentageQuery.error,
        classificationConfidence: getClassificationConfidenceQuery.data?.data,
        classificationPercentage: getClassificationPercentageQuery.data?.data,
        changeOrganization,
        refreshReport,
        reportParams,
    };
}
