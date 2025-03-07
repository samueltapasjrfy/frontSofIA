import { http } from "./fetch";
import { APIResponse } from "./response";

export const PublicationsApi = {
    findAll: async (params: PublicationsApi.FindAll.Params): Promise<PublicationsApi.FindAll.Response> => {
        const response = await http.get<PublicationsApi.FindAll.Response>('/Publications', params);
        // Sofia no modo Multi-label retorna um array de classificações para cada publicação
        // Então é necessário pegar a classificação com a maior confiança
        if (response.data.publications.length > 0) {
            response.data.publications = response.data.publications.map(publication => {
                if (!publication.classifications || publication.classifications.length === 0) return publication
                const classification = publication.classifications.reduce((acc, curr) => {
                    if (curr.confidence > acc.confidence) return curr
                    return acc
                }, publication.classifications[0])

                return {
                    ...publication,
                    classifications: [{
                        classification: classification.classification,
                        confidence: classification.confidence
                    }]
                }
            });
        }
        return response.data;
    },
    save: async (data: PublicationsApi.Save.Params): Promise<APIResponse<PublicationsApi.Save.Response>> => {
        const response = await http.post<PublicationsApi.Save.Response>('/Publications', data);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },
    saveBulk: async (data: PublicationsApi.SaveBulk.Params): Promise<APIResponse<PublicationsApi.SaveBulk.Response>> => {
        const response = await http.post<PublicationsApi.SaveBulk.Response>('/Publications/Batch', data);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },
    getStatusReport: async (): Promise<PublicationsApi.Report.Response> => {
        const response = await http.get<PublicationsApi.Report.Response>('/Publications/report/status');
        return response.data;
    }
}

export namespace PublicationsApi {
    export namespace FindAll {
        export type Params = {
            page: number;
            limit: number;
        };
        export type Publication = {
            id: string;
            idInternal: string;
            status: { id: number; value: string };
            caseType?: { id: number; value: string };
            classifications?: { classification: string, confidence: number }[];
            errorDescription?: string;
            litigationNumber?: string;
            date?: string;
            court?: string;
            stage?: string;
            actions?: string[];
            scheduledDate?: Date;
            metadata: any;
            text?: string;
            createdAt?: Date;
            updatedAt?: Date;
        };
        export type Response = {
            publications: Publication[];
            total: number;
        };
    }

    export namespace Report {
        export type Response = {
            classified: number;
            errors: number;
            processing: number;
            pending: number;
            total: number;
        }
    }

    export namespace Save {
        export type Params = {
            litigationNumber: string;
            text: string;
            idInternal?: string;
            caseType?: number;
        };
        export type Response = {
            id: string;
            status: { id: number; value: string };
        }
    }

    export namespace SaveBulk {
        export type Params = Save.Params[];
        export type Response = {
            idBatch: string;
            publications: Save.Response[];
        }
    }
}