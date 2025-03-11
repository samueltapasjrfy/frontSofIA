import { http } from "./fetch";
import { APIResponse } from "./response";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { PUBLICATION_STATUS } from '@/constants/publications';

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
                        id: classification.id,
                        classification: classification.classification,
                        confidence: classification.confidence,
                        status: classification.status
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
    },
    reclassify: async (params: PublicationsApi.Reclassify.Params): Promise<void> => {
        await http.patch(`/Publications/${params.idPublication}/Classification/${params.idClassification}`);
    },
    approveClassification: async (params: PublicationsApi.ApproveClassification.Params): Promise<void> => {
        await http.patch(`/Publications/${params.idPublication}/Classification/${params.idClassification}/approve`);
    },
    findAllClassifications: async (params: PublicationsApi.FindAllClassifications.Params): Promise<PublicationsApi.FindAllClassifications.Response> => {
        const query = new URLSearchParams();
        if (params.idCaseType) query.set('idCaseType', params.idCaseType.toString());
        const response = await http.get<PublicationsApi.FindAllClassifications.Response>(`/Classifications?${query.toString()}`);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await http.delete(`/Publications/${id}`);
    },
    exportToXLSX: async (): Promise<void> => {
        try {
            // Buscar todas as publicações sem paginação
            const response = await http.get<PublicationsApi.FindAll.Response>('/Publications', { 
                noPagination: true 
            });
            
            // Preparar dados para exportação
            const data = response.data.publications.map(pub => ({
                'Nº Processo': pub.litigationNumber || '-',
                'Texto': pub.text || '-',
                'Modalidade': pub.caseType?.value || '-',
                'Tipo': pub.classifications?.[0]?.classification || '-',
                'Status Classificação': pub.classifications?.[0]?.status.value || '-',
                'Confiança': pub.classifications?.[0]?.confidence 
                    ? `${(pub.classifications[0].confidence * 100).toFixed(0)}%` 
                    : '-',
                'Status': pub.status.value || '-',
                'Data Inserção': pub.createdAt 
                    ? dayjs(pub.createdAt).format('DD/MM/YYYY HH:mm') 
                    : '-',
                'Data Processamento': pub.status.id === PUBLICATION_STATUS.COMPLETED && pub.updatedAt
                    ? dayjs(pub.updatedAt).format('DD/MM/YYYY HH:mm')
                    : '-'
            }));

            // Criar workbook e worksheet
            const ws = XLSX.utils.json_to_sheet(data);

            // Ajustar largura das colunas
            const colWidths = [
                { wch: 25 }, // Nº Processo
                { wch: 50 }, // Texto
                { wch: 15 }, // Modalidade
                { wch: 15 }, // Tipo
                { wch: 20 }, // Status Classificação
                { wch: 12 }, // Confiança
                { wch: 15 }, // Status
                { wch: 20 }, // Data Inserção
                { wch: 20 }, // Data Processamento
            ];
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Publicações');

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
            classifications?: { 
                id: number;
                classification: string;
                confidence: number;
                status: {
                    id: number;
                    value: string;
                };
            }[];
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

    export namespace Reclassify {
        export type Params = {
            idPublication: string;
            idClassification: number;
        };
    }

    export namespace ApproveClassification {
        export type Params = {
            idPublication: string;
            idClassification: number;
        };
    }

    export namespace FindAllClassifications {
        export type Params = {
            idCaseType?: number;
        }
        export type Response = {
            classifications: {
                id: number;
                classification: string;
                caseType?: {
                    id: number;
                    caseType: string;
                }
            }[];
            total: number;
        }
    }
}