import { http } from "./fetch";
import { APIResponse } from "./response";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import dayjs from "dayjs";

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

    exportToXLSX: async (params: AudiencesApi.FindAll.Params): Promise<void> => {
        try {
            // Buscar todas as audiências sem paginação
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

            const response = await http.get<AudiencesApi.FindAll.Response>(`/audiences?${queryParams.toString()}`);

            // Preparar dados para exportação
            const data = response.data.audiences.map(audience => ({
                'Nº Processo': audience.process?.cnj || '-',
                'Data': audience.date ? dayjs(audience.date).format('DD/MM/YYYY HH:mm') : '-',
                'Local': audience.location || '-',
                'Descrição': audience.description || '-',
                'Tipo': audience.type?.type || '-',
                'Status': audience.status?.status || '-',
                'Aprovação': audience.approved === null ? 'Pendente' : audience.approved ? 'Aprovada' : 'Reprovada'
            }));

            // Criar workbook e worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(data);

            // Definir larguras das colunas
            const colWidths = [
                { wch: 25 }, // Nº Processo
                { wch: 20 }, // Data
                { wch: 30 }, // Local
                { wch: 50 }, // Descrição
                { wch: 20 }, // Tipo
                { wch: 20 }, // Status
                { wch: 15 }, // Aprovação
            ];
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, 'Audiências');

            // Gerar arquivo e fazer download
            const excelBuffer = XLSX.write(wb, {
                bookType: 'xlsx',
                type: 'array'
            });

            const dataBlob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Nome do arquivo com timestamp
            const fileName = `audiencias_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`;

            saveAs(dataBlob, fileName);
        } catch (error) {
            console.error('Erro ao exportar audiências:', error);
            throw error; // Propagar erro para ser tratado no componente
        }
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
            process: { id: string; cnj: string } | null;
        };

        export type Response = {
            audiences: Audience[];
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
