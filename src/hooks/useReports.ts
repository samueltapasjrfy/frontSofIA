"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { ReportsApi } from "@/api/reportsApi";
import { QUERY_KEYS } from "@/constants/cache";

const PROCESSING_STATUS = [1, 2];

export function useReports() {
    const [params, setParams] = useState<ReportsApi.Find.Params>({
        page: 1,
        limit: 10,
    });
    const queryClient = useQueryClient();

    const reportsQuery = useQuery({
        queryKey: [QUERY_KEYS.REPORTS, params],
        queryFn: async () => {
            const query: ReportsApi.Find.Params = {};
            if (params.page) query.page = params.page;
            if (params.limit) query.limit = params.limit;
            if (params.dateStart && params.dateEnd) {
                query.dateStart = params.dateStart;
                query.dateEnd = params.dateEnd;
            }
            if (params.idType) query.idType = params.idType;
            if (params.idStatus) query.idStatus = params.idStatus;
            const data = await ReportsApi.find(query);
            if (!data) throw new Error('Erro ao carregar relatórios');
            return data;
        },
        refetchInterval: (query) => {
            const reports = query.state.data?.reports || [];
            const processing = reports.some(report => PROCESSING_STATUS.includes(report.status.id));
            return processing ? 5000 : false;
        },
    });

    const metadataQuery = useQuery({
        queryKey: [QUERY_KEYS.REPORTS_METADATA],
        queryFn: async () => {
            const data = await ReportsApi.metadata();
            if (!data) throw new Error('Erro ao carregar filtros');
            return data;
        },
        staleTime: 1000 * 60 * 30,
    });

    const changeFilter = (next: Partial<ReportsApi.Find.Params>): void => {
        setParams(prev => ({
            ...prev,
            ...next,
            page: next.page || 1,
        }));
    };

    const invalidateQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS] });
    }, [queryClient]);

    return {
        params,
        reportsQuery,
        metadataQuery,
        changeFilter,
        invalidateQuery,
    };
}
