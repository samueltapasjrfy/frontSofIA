import { http } from "./fetch";
import { APIResponse } from "./response";

export const ReportsApi = {
    createAudience: async (params: ReportsApi.CreateAudience.Params): Promise<APIResponse<ReportsApi.CreateAudience.Response>> => {
        const response = await http.post<ReportsApi.CreateAudience.Response>('/reports/audiences', params);
        return response;
    },

    createCitation: async (params: ReportsApi.CreateAudience.Params): Promise<APIResponse<ReportsApi.CreateAudience.Response>> => {
        const response = await http.post<ReportsApi.CreateAudience.Response>('/reports/citations', params);
        return response;
    },

    find: async (params: ReportsApi.Find.Params): Promise<ReportsApi.Find.Response> => {
        const response = await http.get<ReportsApi.Find.Response>('/reports', params);
        return response.data;
    },

    metadata: async (): Promise<ReportsApi.Metadata.Response> => {
        const response = await http.get<ReportsApi.Metadata.Response>('/reports/metadata');
        return response.data;
    },

    download: async (id: string): Promise<APIResponse<ReportsApi.Download.Response>> => {
        const response = await http.post<ReportsApi.Download.Response>(`/reports/${id}/download`);
        return response;
    },
};

export namespace ReportsApi {
    export namespace CreateAudience {
        export type Params = {
            cnj?: string;
            approvedStatus?: number;
            dateStart?: string;
            dateEnd?: string;
            monitoring?: boolean;
        };

        export type Response = {
            id: string;
        };
    }

    export namespace Find {
        export type Params = {
            page?: number;
            limit?: number;
            dateStart?: string;
            dateEnd?: string;
            idType?: number;
            idStatus?: number;
        };

        export type Report = {
            id: string;
            createdAt: string;
            fileName: string | null;
            errorMessage: string | null;
            requesterName: string | null;
            type: { id: number; name: string };
            status: { id: number; name: string };
        };

        export type Response = {
            reports: Report[];
            total: number;
        };
    }

    export namespace Metadata {
        export type Option = {
            id: number;
            name: string;
        };

        export type Response = {
            types: Option[];
            statuses: Option[];
        };
    }

    export namespace Download {
        export type Response = {
            url: string;
        };
    }
}
