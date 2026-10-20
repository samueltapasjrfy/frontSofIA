import { http } from "./fetch";
import { APIResponse } from "./response";

export const AudiencesApi = {
    findAll: async (params: AudiencesApi.FindAll.Params): Promise<AudiencesApi.FindAll.Response> => {
        const response = await http.get<AudiencesApi.FindAll.Response>('/audiences', params);
        return response.data;
    },

    getTotalPending: async (): Promise<AudiencesApi.TotalPending.Response> => {
        const response = await http.get<AudiencesApi.TotalPending.Response>('/audiences/total-pending');
        return response.data;
    },

    updateStatusBulk: async (data: AudiencesApi.UpdateStatusBulk.Params): Promise<APIResponse<AudiencesApi.UpdateStatusBulk.Response>> => {
        const response = await http.put<AudiencesApi.UpdateStatusBulk.Response>('/audiences/bulk-update-status', data);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },
}

export namespace AudiencesApi {
    export namespace FindAll {
        export type Params = {
            page?: number;
            limit?: number;
            cnj?: string;
            dateStart?: string;
            dateEnd?: string;
            approvedStatus?: number | null;
            monitoring?: boolean | null;
            noPagination?: boolean;
        };

        export type Audience = {
            id: string;
            date: Date;
            location: string;
            description: string;
            type: { id: number; type: string };
            status: { id: number; status: string };
            approved: boolean | null;
            process: {
                id: string;
                cnj: string;
                info: ProcessInfo | null;
            } | null;
        };

        export type Response = {
            audiences: Audience[];
            total: number;
        };

        export type InfoAudience = {
            date: string;
            text: string;
            type: string;
            status: string;
        };

        export type RelatedCase = {
            process: string;
            instance: number;
            court: string;
            distributionDate: string;
        };

        export type ProcessInfo = {
            uf: string | null;
            area: string | null;
            vara: string | null;
            citado: boolean | null;
            foro: string | null;
            juiz: string | null;
            valor: number | null;
            natureza: string | null;
            segredoJustica: boolean | null;
            sistema: string | null;
            dataCitacao: string | null;
            classes: string[] | null;
            extinto: boolean | null;
            arquivado: boolean | null;
            instancia: number | string | null;
            justicaGratuita: boolean | null;
            audiencias: InfoAudience[] | null;
            dataCriacao: string | null;
            dataSentenca: string | null;
            assuntoExtra: string | null;
            tribunal: string | null;
            processosRelacionados: RelatedCase[] | null;
            comarca: string | null;
            liminar: boolean | null;
        };
    }

    export namespace TotalPending {
        export type Response = {
            total: number;
        };
    }

    export namespace UpdateStatusBulk {
        export type Params = {
            ids: string[];
            status: 'approve' | 'reprove';
        };

        export type Response = {
            totalRequested: number;
            totalFound: number;
            totalUpdated: number;
            approved: boolean;
            updatedIds: string[];
            message: string;
        };
    }
}
