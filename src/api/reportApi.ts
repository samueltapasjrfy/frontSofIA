import { http } from "./fetch";
import { APIResponse } from "./response";

export const ReportApi = {
    getResume: async (params: { idOrganization: string }): Promise<APIResponse<ReportApi.GetResume.Response>> => {
        const urlParams = new URLSearchParams();
        if (params.idOrganization) urlParams.set('idOrganization', params.idOrganization);
        const response = await http.get<ReportApi.GetResume.Response>(`/Report/Resume?${urlParams.toString()}`);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },
    
    getClassificationConfidence: async (params: ReportApi.ClassificationConfidence.Params): Promise<APIResponse<ReportApi.ClassificationConfidence.Response>> => {
        const urlParams = new URLSearchParams();
        if (params.idOrganization) urlParams.set('idOrganization', params.idOrganization);
        const response = await http.get<ReportApi.ClassificationConfidence.Response>(`/Report/ClassificationConfidence?${urlParams.toString()}`);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    getClassificationPercentage: async (params: ReportApi.ClassificationPercentage.Params): Promise<APIResponse<ReportApi.ClassificationPercentage.Response>> => {
        const urlParams = new URLSearchParams();
        if (params.idOrganization) urlParams.set('idOrganization', params.idOrganization);
        const response = await http.get<ReportApi.ClassificationPercentage.Response>(`/Report/ClassificationPercentage?${urlParams.toString()}`);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    }
};

export namespace ReportApi {
    export namespace GetResume {
        export type Params = {
            idOrganization: string;
        };
        export type Response = {
            confidence: {
                average: number;
                trendPercentage: number;
            };
            publications: {
                total: number;
                trend: number;
            };
        };
    }

    export namespace ClassificationConfidence {
        export type Params = {
            idOrganization: string;
        };
        export type ClassificationData = {
            id: number;
            name: string;
            averageConfidence: number;
            count: number;
        };
        export type Response = {
            classifications: ClassificationData[];
        };
    }

    export namespace ClassificationPercentage {
        export type Params = {
            idOrganization: string;
        };
        export type ClassificationData = {
            id: number;
            name: string;
            count: number;
            percentage: number;
        };
        export type Response = {
            classifications: ClassificationData[];
        };
    }
}