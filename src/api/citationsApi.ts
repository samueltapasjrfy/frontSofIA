import { http } from "./fetch";
import { APIResponse } from "./response";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import dayjs from "dayjs";

export const CitationsApi = {
    findAll: async (params: CitationsApi.FindAll.Params): Promise<CitationsApi.FindAll.Response> => {
        const response = await http.get<CitationsApi.FindAll.Response>('/citations', params);
        return response.data;
    },

    getTotalPending: async (): Promise<CitationsApi.TotalPending.Response> => {
        const response = await http.get<CitationsApi.TotalPending.Response>('/citations/total-pending');
        return response.data;
    },

    updateStatusBulk: async (data: CitationsApi.UpdateStatusBulk.Params): Promise<APIResponse<CitationsApi.UpdateStatusBulk.Response>> => {
        const response = await http.put<CitationsApi.UpdateStatusBulk.Response>('/citations/bulk-update-status', data);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    exportToXLSX: async (params: CitationsApi.FindAll.Params): Promise<void> => {
        try {
            // Buscar todas as citações sem paginação
            const queryParams = new URLSearchParams();
            queryParams.set('noPagination', 'true');
            if (params.page) queryParams.set('page', params.page.toString());
            if (params.limit) queryParams.set('limit', params.limit.toString());
            if (params.cnj) queryParams.set('cnj', params.cnj);
            if (params.dateStart) queryParams.set('dateStart', params.dateStart);
            if (params.dateEnd) queryParams.set('dateEnd', params.dateEnd);
            if (params.approvedStatus !== undefined && params.approvedStatus !== null) {
                queryParams.set('approvedStatus', params.approvedStatus.toString());
            }

            const response = await http.get<CitationsApi.FindAll.Response>(`/citations?${queryParams.toString()}`);

            // Preparar dados para exportação
            const data = response.data.citations.map(citation => ({
                'Nº Processo': citation.process?.cnj || '-',
                'Data Consumo': citation.createdAt ? dayjs(citation.createdAt).format('DD/MM/YYYY HH:mm') : '-',
                'Texto da Citação': citation.text || '-',
                'Aprovação': citation.approved === null ? 'Pendente' : citation.approved ? 'Aprovada' : 'Reprovada'
            }));

            // Criar workbook e worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(data);

            // Definir larguras das colunas
            const colWidths = [
                { wch: 25 }, // Nº Processo
                { wch: 20 }, // Data Consumo
                { wch: 80 }, // Texto da Citação
                { wch: 15 }, // Aprovação
            ];
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, 'Citações');

            // Gerar arquivo e fazer download
            const excelBuffer = XLSX.write(wb, {
                bookType: 'xlsx',
                type: 'array'
            });

            const dataBlob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Nome do arquivo com timestamp
            const fileName = `citacoes_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`;

            saveAs(dataBlob, fileName);
        } catch (error) {
            console.error('Erro ao exportar citações:', error);
            throw error; // Propagar erro para ser tratado no componente
        }
    },
}

export namespace CitationsApi {
    export namespace FindAll {
        export type Params = {
            page?: number;
            limit?: number;
            cnj?: string;
            dateStart?: string;
            dateEnd?: string;
            approvedStatus?: number | null;
            noPagination?: boolean;
        };

        export type Citation = {
            id: number;
            text: string;
            createdAt: Date;
            approved: boolean | null;
            process: { id: string; cnj: string } | null;
        };

        export type Response = {
            citations: Citation[];
            total: number;
        };
    }

    export namespace TotalPending {
        export type Response = {
            total: number;
        };
    }

    export namespace UpdateStatusBulk {
        export type Params = {
            ids: number[];
            status: 'approve' | 'reprove';
        };

        export type Response = {
            totalRequested: number;
            totalFound: number;
            totalUpdated: number;
            approved: boolean;
            updatedIds: number[];
            message: string;
        };
    }
}
