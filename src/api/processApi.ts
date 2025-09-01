import dayjs from "dayjs";
import { http } from "./fetch";
import { APIResponse } from "./response";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const ProcessApi = {
    findAll: async (params: ProcessApi.FindAll.Params): Promise<ProcessApi.FindAll.Response> => {
        const queryParams = new URLSearchParams();
        queryParams.set('adapter', 'false');
        if (params.page) queryParams.set('page', params.page.toString());
        if (params.limit) queryParams.set('limit', params.limit.toString());
        if (params.filter) {
            Object.entries(params.filter).forEach(([key, value]) => {
                if (value) queryParams.set(key, value.toString());
            });
        }

        const response = await http.get<ProcessApi.FindAll.Response>(`/Process?${queryParams.toString()}`);
        return response.data;
    },

    findOne: async (id: string): Promise<ProcessApi.FindOne.Response> => {
        const response = await http.get<ProcessApi.FindOne.Response>(`/Process/${id}?adapter=false`);
        return response.data;
    },

    findBatches: async (params: ProcessApi.FindBatches.Params): Promise<ProcessApi.FindBatches.Response> => {
        const response = await http.get<ProcessApi.FindBatches.Response>('/Process/batch', params);
        return response.data;
    },

    findBatch: async (id: string): Promise<ProcessApi.FindBatch.Response> => {
        const response = await http.get<ProcessApi.FindBatch.Response>(`/Process/batch/${id}`);
        return response.data;
    },

    handleCitation: async (params: ProcessApi.HandleCitation.Params): Promise<ProcessApi.HandleCitation.Response> => {
        const response = await http.post<ProcessApi.HandleCitation.Response>(
            `/Process/${params.id}/Citation/${params.action}`
        );
        return response.data;
    },

    activateMonitoring: async (id: string): Promise<void> => {
        await http.post(`/Process/${id}/Monitoring`);
    },

    deactivateMonitoring: async (id: string): Promise<void> => {
        await http.delete(`/Process/${id}/Monitoring`);
    },

    deleteProcess: async (id: string): Promise<void> => {
        await http.delete(`/Process/${id}`);
    },

    deleteBulkProcess: async (processes: ProcessApi.DeleteBulkProcess.Params): Promise<void> => {
        await http.post(`/Process/deleteBulk`, processes);
    },
    save: async (data: ProcessApi.Save.Params): Promise<APIResponse<ProcessApi.Save.Response>> => {
        const response = await http.post<ProcessApi.Save.Response>('/Process', data);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    deactivateMonitoringBulk: async (data: ProcessApi.DeactivateMonitoringBulk.Params): Promise<APIResponse<void>> => {
        const response = await http.post('/Process/Monitoring/DeactivateBulk', data);
        return {
            data: undefined,
            message: response.message,
            error: response.error
        };
    },

    report: async (): Promise<ProcessApi.Report.Response> => {
        const response = await http.get<ProcessApi.Report.Response>('/Process/report');
        return response.data;
    },

    setImported: async (params: ProcessApi.SetImported.Params): Promise<APIResponse<void>> => {
        const response = await http.post<void>('/Process/setImported', params);
        return {
            data: undefined,
            message: response.message,
            error: response.error
        };
    },

    exportToXLSX: async (params: ProcessApi.FindAll.Params["filter"]): Promise<void> => {
        try {
            // Buscar todas as publicações sem paginação
            const queryParams = new URLSearchParams();
            queryParams.set('noPagination', 'true');
            console.log(params);
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value) queryParams.set(key, value.toString());
                });
            }

            const response = await http.get<ProcessApi.FindAll.Response>(`/Process?${queryParams.toString()}`);

            // Preparar dados para exportação
            const data = response.data.processes.map(pub => ({
                'Nº Processo': pub.cnj || '-',
                'Instância': pub.instance || '-',
                'Status': pub.imported ? 'Importado' : pub.status?.value || '-',
                'Data Inserção': pub.createdAt
                    ? dayjs(pub.createdAt).format('DD/MM/YYYY HH:mm')
                    : '-',
                'Citado': pub.cited ? 'Sim' : 'Não',
                'Data da Citação': pub.citedAt
                    ? dayjs(pub.citedAt).format('DD/MM/YYYY')
                    : '-',
                'Núcleo': pub.metadata?.nucleo || '-',
                'Cliente': pub.metadata?.cliente || '-',
                'Controle Cliente': pub.metadata?.controleCliente || '-',
                'Autor ou Réu': pub.metadata?.clienteAutorOuReu || '-',
                'Data Terceirização': pub.metadata?.dataTerceirizacao || '-',
                'Adv Líder / Responsável': pub.metadata?.advLiderResponsavel || '-',
                'Data Distribuição': pub.dateDistribution ? dayjs(pub.dateDistribution).format('DD/MM/YYYY') : '-',
                'Segredo de Justiça': pub.secret ? 'Sim' : 'Não',
                'Tribunal': pub.jurisdiction || '-',
                'Juiz': pub.judge || '-',
                'Valor': pub.value ? Number(pub.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-',
                'Comarca': pub.judicialDistrict || '-',
                'Liminar': pub.preliminaryInjunction ? 'Sim' : 'Não',
                'Foro': pub.foro || '-',
                'Vara': pub.vara || '-',
                'UF': pub.uf || '-',
                'Classes': pub.classes ? pub.classes.join(', ') : '-',
                'Assunto Extra': pub.extraSubject || '-',
                'Área': pub.area || '-',
                'Arquivado': pub.archived ? 'Sim' : 'Não',
                'Extinto': pub.extinct ? 'Sim' : 'Não',
                'Justiça Gratuita': pub.legalAid ? 'Sim' : 'Não',
                'Fonte do Sistema': pub.system || '-',
                'Tribunal Original': pub.originalCourt || '-',
                'Natureza': pub.nature || '-',
                // 'Audiências': pub.audiences ? pub.audiences.map(aud => `${dayjs(aud.date).format('DD/MM/YYYY')}: ${aud.text} (${aud.type}, ${aud.status})`).join('; ') : '-'
            }));

            // Preparar dados para a aba de audiências
            const audiencesData: any[] = [];
            response.data.processes.forEach(proc => {
                if (proc.audiences && proc.audiences.length > 0) {
                    proc.audiences.forEach(aud => {
                        audiencesData.push({
                            'Nº Processo': proc.cnj || '-',
                            'Data': aud.date ? dayjs(aud.date).format('DD/MM/YYYY HH:mm') : '-',
                            'Descrição': aud.text || '-',
                            'Tipo': aud.type || '-',
                            'Status': aud.status || '-'
                        });
                    });
                }
            });

            // Preparar dados para a aba de partes contrárias
            const partiesData: any[] = [];
            response.data.processes.forEach(proc => {
                if (proc.parties && proc.parties.length > 0) {
                    proc.parties.forEach(party => {
                        partiesData.push({
                            'Nº Processo': proc.cnj || '-',
                            'Nome': party.name || '-',
                            'Documento': party.document || '-',
                            'Tipo': party.type || '-'
                        });
                    });
                }
            });

            // Criar workbook e worksheets
            const wb = XLSX.utils.book_new();

            // Planilha principal de processos
            const mainWs = XLSX.utils.json_to_sheet(data);
            const mainColWidths = [
                { wch: 25 }, // Nº Processo
                { wch: 10 }, // Instância
                { wch: 15 }, // Status
                { wch: 15 }, // Data Inserção
                { wch: 15 }, // Citado
                { wch: 15 }, // Data da Citação
                { wch: 15 }, // Segredo de Justiça
                { wch: 15 }, // Tribunal
                { wch: 15 }, // Juiz
                { wch: 15 }, // Valor
                { wch: 15 }, // Comarca
                { wch: 15 }, // Liminar
                { wch: 15 }, // Foro
                { wch: 15 }, // Vara
                { wch: 15 }, // UF
                { wch: 15 }, // Classes
                { wch: 15 }, // Assunto Extra
                { wch: 15 }, // Área
                { wch: 15 }, // Arquivado
                { wch: 15 }, // Extinto
                { wch: 15 }, // Justiça Gratuita
                { wch: 15 }, // Fonte do Sistema
                { wch: 15 }, // Tribunal Original
                { wch: 15 }, // Natureza
            ];
            mainWs['!cols'] = mainColWidths;
            XLSX.utils.book_append_sheet(wb, mainWs, 'Processos');

            // Planilha de audiências
            if (audiencesData.length > 0) {
                const audiencesWs = XLSX.utils.json_to_sheet(audiencesData);
                const audiencesColWidths = [
                    { wch: 25 }, // Nº Processo
                    { wch: 20 }, // Data
                    { wch: 40 }, // Descrição
                    { wch: 15 }, // Tipo
                    { wch: 15 }, // Status
                ];
                audiencesWs['!cols'] = audiencesColWidths;
                XLSX.utils.book_append_sheet(wb, audiencesWs, 'Audiências');
            }

            // Planilha de partes contrárias
            if (partiesData.length > 0) {
                const partiesWs = XLSX.utils.json_to_sheet(partiesData);
                const partiesColWidths = [
                    { wch: 25 }, // Nº Processo
                    { wch: 40 }, // Nome
                    { wch: 20 }, // Documento
                    { wch: 15 }, // Tipo
                ];
                partiesWs['!cols'] = partiesColWidths;
                XLSX.utils.book_append_sheet(wb, partiesWs, 'Partes');
            }

            // Gerar arquivo e fazer download
            const excelBuffer = XLSX.write(wb, {
                bookType: 'xlsx',
                type: 'array'
            });

            const dataBlob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Nome do arquivo com timestamp
            const fileName = `processos_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`;

            saveAs(dataBlob, fileName);
        } catch (error) {
            console.error('Erro ao exportar processos:', error);
            throw error; // Propagar erro para ser tratado no componente
        }
    }
};

export namespace ProcessApi {
    export namespace FindAll {
        export type Params = {
            page?: number;
            limit?: number;
            filter?: {
                cnj?: string;
                imported?: boolean;
                status?: number;
                monitoring?: boolean;
                batch?: string;
                requester?: string;
                initialDate?: string;
                finalDate?: string;
                client?: string;
            }
        };

        export type Process = {
            id: string;
            cnj: string;
            createdAt: string;
            status: {
                id: number;
                value: string;
            };
            requester: {
                id: string;
                name: string;
            } | null;
            imported: boolean;
            idBatch: string
            instance: number;
            processCreatedAt: string;
            cited: boolean;
            citedAt: string;
            secret: boolean;
            court: string;
            vara: string | null;
            uf: string;
            judicialDistrict: string;
            jurisdiction: string;
            extraSubject: string;
            area: string;
            archived: boolean;
            extinct: boolean;
            value: string;
            preliminaryInjunction: boolean;
            legalAid: boolean;
            system: string;
            originalCourt: string | null;
            nature: string;
            judge: string;
            classes: string[];
            foro: string;
            dateDistribution: string;
            audiences: {
                date: string;
                text: string;
                type: string;
                status: string;
            }[];
            parties: {
                id: string;
                name: string;
                document: string | null;
                type: string;
            }[];
            metadata: Record<string, any>;
            monitoring: boolean;
            dateSentence?: string;
            relatedCases?: RelatedCase[];
        };

        export type RelatedCase = {
            process: string;
            instance: number;
            court: string;
            distributionDate: string;
        };

        export type Response = {
            processes: Process[];
            total: number;
        };
    }

    export namespace FindOne {
        export type Response = {
            data: FindAll.Process;
        };
    }

    export namespace FindBatches {
        export type Params = {
            page?: number;
            limit?: number;
        };

        export type Batch = {
            id: string;
            status: {
                id: number;
                value: string;
            };
            processCount: number;
            createdAt: string;
        };

        export type Response = {
            data: {
                batches: Batch[];
                pagination: {
                    total: number;
                    page: number;
                    limit: number;
                    pages: number;
                };
            };
        };
    }

    export namespace FindBatch {
        export type Response = {
            data: {
                id: string;
                status: {
                    id: number;
                    value: string;
                };
                createdAt: string;
                processes: FindAll.Process[];
            };
        };
    }

    export namespace HandleCitation {
        export type Params = {
            id: string;
            action: string;
        };

        export type Response = {
            data: {
                id: string;
                cited: boolean;
                citedAt: string | null;
            };
        };
    }

    export namespace Save {
        export type Params = {
            processes: {
                cnj: string;
                metadata?: Record<string, any>;
            }[];
            monitoring: boolean;
            registration: boolean;
        };

        export type Response = {
            message: string;
        };
    }

    export namespace Report {
        export type Response = {
            total: number;
            monitored: number;
        };
    }

    export namespace DeactivateMonitoringBulk {
        export type Params = {
            cnjs: string[];
        };
    }

    export namespace DeleteBulkProcess {
        export type Params = {
            processes: { cnj: string }[];
        };
    }

    export namespace SetImported {
        export type Params = {
            cnjs: string[];
            ids: string[];
        };
    }
}
