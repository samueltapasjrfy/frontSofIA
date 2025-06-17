import { handleApiParams } from "@/utils/handleApiParams";
import { http } from "./fetchv2";
import { APIResponse } from "./response";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
    },

    getTotal: async (): Promise<PublicationV2Api.GetTotal.Response> => {
        const response = await http.get<PublicationV2Api.GetTotal.Response>('/Publications/report/total');
        return response.data;
    },

    getStatistics: async (): Promise<PublicationV2Api.GetStatistics.Response> => {
        const response = await http.get<PublicationV2Api.GetStatistics.Response>('/Publications/report/statistics');
        return response.data;
    },

    getProcessingStatus: async (): Promise<PublicationV2Api.GetProcessingStatus.Response> => {
        const response = await http.get<PublicationV2Api.GetProcessingStatus.Response>('/Publications/report/processingStatus');
        return response.data;
    },
    exportToXLSX: async (params: PublicationV2Api.FindAll.Params): Promise<void> => {
        try {
            // Buscar todas as publicações sem paginação
            params.noPagination = true
            delete params.limit
            delete params.page
            const response = await http.get<PublicationV2Api.FindAll.Response>('/Publications', params);
            // Preparar dados para exportação
            const publications = response.data.publications.map(pub => ({
                'ID Publicação': pub.id,
                'ID Externo': pub.idExternal || '-',
                'Nº Processo': pub.info?.cnj || '-',
                'Texto': (pub.text || '-').slice(0, 32000),
                'Modalidade': pub.caseType?.name || '-',
                'Blocos': pub.blocks.length,
                'Status': pub.status.name || '-',
                'Data Inserção': pub.createdAt
                    ? dayjs(pub.createdAt).format('DD/MM/YYYY HH:mm')
                    : '-',
            }));

            // Criar workbook e worksheet
            const publicationsWs = XLSX.utils.json_to_sheet(publications);

            // Ajustar largura das colunas
            const colWidths = [
                { wch: 10 }, // ID
                { wch: 20 }, // ID Externo
                { wch: 20 }, // Nº Processo
                { wch: 50 }, // Texto
                { wch: 15 }, // Modalidade
                { wch: 15 }, // Blocos
                { wch: 15 }, // Status
                { wch: 20 }, // Data Inserção
            ];
            publicationsWs['!cols'] = colWidths;

            const blocks = response.data.publications
                .filter(pub => pub.blocks.length > 0)
                .map(pub => pub.blocks.map(block => ({
                    'ID Bloco': block.id,
                    'ID Publicação': pub.id,
                    'ID Externo': pub.idExternal || '-',
                    'Nº Processo': pub.info?.cnj || '-',
                    'Texto': block.text,
                    'Status': block.status?.name || '-',
                    'Categoria': block.category?.name || '-',
                    'Tipo': block.type?.name || '-',
                    'Classificação': block.classification?.name || '-',
                    'Subclassificação': block.subClassification?.name || '-',
                    'Recipiente': block.recipient?.name || '-',
                    'Método': block.recipient?.method?.name || '-',
                    'Confiança': block.classification?.confidence?.name || '-',
                    'Polo': block.recipient?.id ? block.recipient?.name + ' - ' + block.recipient?.polo.name : '-',
                })
                )).flat();
            console.log(blocks)
            const blocksWs = XLSX.utils.json_to_sheet(blocks);

            const blocksColWidths = [
                { wch: 10 }, // ID Bloco
                { wch: 10 }, // ID Publicação
                { wch: 20 }, // ID Externo
                { wch: 20 }, // Nº Processo
                { wch: 50 }, // Texto
                { wch: 15 }, // Status
                { wch: 15 }, // Categoria
                { wch: 15 }, // Tipo
                { wch: 15 }, // Classificação
                { wch: 15 }, // Subclassificação
                { wch: 15 }, // Recipiente  
                { wch: 15 }, // Método
                { wch: 15 }, // Confiança
                { wch: 15 }, // Polo
            ];
            blocksWs['!cols'] = blocksColWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, publicationsWs, 'Publicações');
            XLSX.utils.book_append_sheet(wb, blocksWs, 'Blocos');

            // Gerar arquivo e fazer download
            const excelBuffer = XLSX.write(wb, {
                bookType: 'xlsx',
                type: 'array'
            });

            const dataBlob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Nome do arquivo com timestamp
            const fileName = `publicacoes_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`;

            saveAs(dataBlob, fileName);
        } catch (error) {
            console.error('Erro ao exportar publicações:', error);
            throw error; // Propagar erro para ser tratado no componente
        }
    }
}

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
            noPagination?: boolean;
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

    export namespace GetTotal {
        export type Response = {
            total: number;
            lastDay: number;
        }
    }

    export namespace GetStatistics {
        export type Response = {
            errorsPercentage: number;
            avgTime: number;
            precision: number;
        }
    }

    export namespace GetProcessingStatus {
        export type Response = {
            total: number;
            classified: number;
            pending: number;
            processing: number;
            notClassified: number;
        }
    }
}
