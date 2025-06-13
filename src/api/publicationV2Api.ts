import { handleApiParams } from "@/utils/handleApiParams";
import { http } from "./fetchv2";
import { APIResponse } from "./response";

export const PublicationV2Api = {
    findAll: async (params: PublicationV2Api.FindAll.Params): Promise<PublicationV2Api.FindAll.Response> => {
        if (params.status && !Array.isArray(params.status)) {
            params.status = [params.status];
        }
        if (params.caseType && !Array.isArray(params.caseType)) {
            params.caseType = [params.caseType];
        }
        const response = await http.get<PublicationV2Api.FindAll.Response>(`/Publications?${handleApiParams(params).toString()}`);
        return response.data;
    },

    findOne: async (params: PublicationV2Api.FindOne.Params): Promise<PublicationV2Api.FindOne.Response> => {
        const response = await http.get<PublicationV2Api.FindOne.Response>(`/Publications/${params.id}`);
        return response.data;
    },

    save: async (data: PublicationV2Api.Save.Params): Promise<APIResponse<PublicationV2Api.Save.Response>> => {
        const response = await http.post<PublicationV2Api.Save.Response>('/Publications', data);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    delete: async (id: string): Promise<APIResponse<void>> => {
        const response = await http.delete<void>(`/Publications/${id}`);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    deleteBlock: async (id: string): Promise<APIResponse<void>> => {
        const response = await http.delete<void>(`/Blocks/${id}`);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    validateBlock: async (id: string, status: 'approve' | 'reprove'): Promise<APIResponse<void>> => {
        const response = await http.patch<void>(`/Blocks/${id}/${status}`);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    validatePublication: async (id: string, status: 'approve' | 'reprove'): Promise<APIResponse<void>> => {
        const response = await http.patch<void>(`/Publications/${id}/validate/${status}`);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    findCaseTypes: async (params: PublicationV2Api.FindCaseTypes.Params): Promise<PublicationV2Api.FindCaseTypes.Response> => {
        const response = await http.get<PublicationV2Api.FindCaseTypes.Response>(`/Publications/CaseTypes?${handleApiParams(params).toString()}`);
        return response.data;
    },

    findClassifications: async (params: PublicationV2Api.FindClassifications.Params): Promise<PublicationV2Api.FindClassifications.Response> => {
        const response = await http.get<PublicationV2Api.FindClassifications.Response>(`/Blocks/Classifications?${handleApiParams(params).toString()}`);
        return response.data;
    },

    findRecipients: async (params: PublicationV2Api.FindRecipients.Params): Promise<PublicationV2Api.FindRecipients.Response> => {
        const response = await http.get<PublicationV2Api.FindRecipients.Response>(`/Blocks/Recipients?${handleApiParams(params).toString()}`);
        return response.data;
    },

    findCategories: async (params: PublicationV2Api.FindCategories.Params): Promise<PublicationV2Api.FindCategories.Response> => {
        const response = await http.get<PublicationV2Api.FindCategories.Response>(`/Blocks/Categories?${handleApiParams(params).toString()}`);
        return response.data;
    }
}

// Funções auxiliares para mapeamento
// const getCaseTypeLabel = (caseType: number): string => {
//     const caseTypeMap: Record<number, string> = {
//         1: "Cível",
//         2: "Criminal",
//         3: "Trabalhista",
//         4: "Tributário",
//         // Adicionar mais conforme necessário
//     };
//     return caseTypeMap[caseType] || "Não informado";
// };

// const getStatusLabel = (status: number): string => {
//     const statusMap: Record<number, string> = {
//         1: "Pendente",
//         2: "Processando",
//         3: "Concluído",
//         4: "Erro",
//         // Adicionar mais conforme necessário
//     };
//     return statusMap[status] || "Desconhecido";
// };

export namespace PublicationV2Api {
    export type Block = {
        id: string;
        text: string;
        status: {
            id: number;
            name: string;
        };
        category: {
            id: number;
            name: string;
        };
        type: {
            id: number;
            name: string;
        };
        validation: {
            id: number;
            name: string;
        };
        recipient?: {
            id: number;
            name: string;
            method: {
                id: number;
                name: string;
            };
            confidence: {
                id: number;
                name: string;
            };
            polo: {
                id: number;
                name: string;
            };
        };
        classification: {
            id: number;
            name: string;
            confidence: {
                id: number;
                name: string;
            }
        };
        subClassification: {
            id: number;
            name: string;
            confidence: {
                id: number;
                name: string;
            }
        };
    }

    export type Publication = {
        id: string;
        idExternal: string;
        text: string;
        company: {
            id: number;
            name: string;
        };
        status: {
            id: number;
            name: string;
        };
        caseType: {
            id: number;
            name: string;
        };
        info: {
            date?: string;
            court?: string;
            stage?: string;
            cnj?: string;
        };
        blocks: Block[];
        createdAt: Date;
    };
    export namespace FindAll {
        export type Params = {
            page?: number;
            limit?: number;
            status?: number[];
            caseType?: number[];
            classification?: number[];
            recipient?: number[];
            category?: number[];
            search?: string;
        };


        export type Response = {
            publications: Publication[];
            total: number;
        }
    }

    export namespace FindOne {
        export type Params = {
            id: string;
        };

        export type Response = Publication;
    }

    export namespace Save {
        export type PublicationInput = {
            cnj: string,
            text: string,
            idInternal?: string,
            caseType?: number,
            metadata?: {
                date: string,
                court: string,
                stage: string
            }
        };

        export type Params = PublicationInput[];

        export type PublicationResult = {
            id: string;
            status: number;
            processedAt?: string;
            error?: string;
        };

        export type Response = {
            results: PublicationResult[];
            summary: {
                total: number;
                success: number;
                errors: number;
            };
        };
    }

    export namespace FindCaseTypes {
        export type Params = {
            lastId?: number;
            limit?: number;
            search?: string;
        };

        export type CaseType = {
            id: number;
            name: string;
        }

        export type Response = {
            caseTypes: Array<CaseType>;
            total: number;
            hasMore: boolean;
            lastId: number | null;
        };
    }

    export namespace FindClassifications {
        export type Params = {
            lastId?: number;
            limit?: number;
            search?: string;
        };

        export type Classification = {
            id: number;
            classification: string;
        }

        export type Response = {
            classifications: Array<Classification>;
            total: number;
            hasMore: boolean;
            lastId: number | null;
        };
    }

    export namespace FindRecipients {
        export type Params = {
            lastId?: number;
            limit?: number;
            search?: string;
        };

        export type Recipient = {
            id: number;
            recipient: string;
            polo: {
                id: number;
                name: string;
            };
        }

        export type Response = {
            recipients: Array<Recipient>;
            total: number;
            hasMore: boolean;
            lastId: number | null;
        };
    }

    export namespace FindCategories {
        export type Params = {
            lastId?: number;
            limit?: number;
            search?: string;
        };

        export type Category = {
            id: number;
            category: string;
        }

        export type Response = {
            categories: Array<Category>;
            total: number;
            hasMore: boolean;
            lastId: number | null;
        }
    }
}
