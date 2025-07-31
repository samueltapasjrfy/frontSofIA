import dayjs from "dayjs";
import { APIResponse } from "./response";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { http } from "./fetch";

const nexaApiUrl = process.env.NEXT_PUBLIC_NEXA_API_URL;

const getHeaders = async (idCompany: string): Promise<any> => {
    const apiKey = await getApiKey(idCompany);
    return {
        'Authorization': `ApiKey ${apiKey.apiKey}`
    }
}

const getApiKey = async (idCompany: string): Promise<ApiKey> => {
    const cookieName = `Nexa_apiKey_${idCompany}`;
    const existingApiKey = document.cookie.split('; ').find(row => row.startsWith(cookieName));
    if (existingApiKey) {
        const apiKeyValue = existingApiKey.split('=')[1];
        return JSON.parse(decodeURIComponent(apiKeyValue));
    }

    const response = await http.get<ApiKey>('/externalServices/apiKeys', {
        idService: 2, //Nexa
    });

    const apiKeyData = response.data;
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);
    document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(apiKeyData))}; expires=${expires.toUTCString()}; path=/`;

    return apiKeyData;
}

const createUrlSearchParams = (params: DocumentApi.FindDocuments.Params): string => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.status) queryParams.append('status', params.status.toString());
    if (params?.text) queryParams.append('text', params.text);
    if (params?.classification) queryParams.append('classification', params.classification.toString());
    if (params?.id) queryParams.append('id', params.id);
    return queryParams.toString() ? `?${queryParams.toString()}` : '';
}

export const DocumentApi = {
    findDocuments: async (params: DocumentApi.FindDocuments.Params): Promise<APIResponse<DocumentApi.FindDocuments.Response>> => {
        const headers = await getHeaders(params?.idCompany || '');
        const url = `/Documents${createUrlSearchParams(params)}`;
        const response = await fetch(`${nexaApiUrl}${url}`, {
            method: 'GET',
            headers: headers
        }).then(res => res.json());

        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    analyzeDocument: async (params: DocumentApi.AnalyzeDocument.Params): Promise<APIResponse<DocumentApi.AnalyzeDocument.Response>> => {
        const headers = await getHeaders(params.idCompany);
        const formData = new FormData();
        formData.append('file', params.file);
        const response = await fetch(`${nexaApiUrl}/Documents`, {
            method: 'POST',
            headers: headers,
            body: formData
        }).then(res => res.json());

        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },
    exportToXLSX: async (params: DocumentApi.FindDocuments.Params): Promise<void> => {
        try {
            const headers = await getHeaders(params.idCompany || '');
            const response = await fetch(`${nexaApiUrl}/Documents${createUrlSearchParams(params)}`, {
                method: 'GET',
                headers: headers,
            }).then(res => res.json());

            // Preparar dados para exportação
            let resource = "Não";
            let rule = "-";
            if (Array.isArray(response.data.documents?.[0]?.mandatoryResources) && response.data.documents?.[0]?.mandatoryResources.length > 0) {
                resource = "Sim";
                rule = response.data.documents?.[0]?.mandatoryResources[0].name || "-";
            }
            const data = response.data.documents.map((doc: DocumentApi.FindDocuments.Document) => ({
                ID: doc.id,
                Texto: (doc.text || '-').slice(0, 32000),
                "Classificação": doc.documentClassifications?.classification?.name || '-',
                "Recurso": resource,
                "Regra": rule,
                Status: doc.status.name,
                'Data de Inserção': doc.createdAt
                    ? dayjs(doc.createdAt).format('DD/MM/YYYY HH:mm')
                    : '-',
            }));

            // Criar workbook e worksheets
            const wb = XLSX.utils.book_new();

            // Planilha principal de processos
            const mainWs = XLSX.utils.json_to_sheet(data);
            const mainColWidths = [
                { wch: 25 }, // ID
                { wch: 50 }, // Texto
                { wch: 15 }, // Classificação
                { wch: 15 }, // Recurso
                { wch: 15 }, // Regra
                { wch: 15 }, // Status
                { wch: 15 }, // Data de Inserção
            ];

            mainWs['!cols'] = mainColWidths;
            XLSX.utils.book_append_sheet(wb, mainWs, 'Sentenças');

            // Gerar arquivo e fazer download
            const excelBuffer = XLSX.write(wb, {
                bookType: 'xlsx',
                type: 'array'
            });

            const dataBlob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Nome do arquivo com timestamp
            const fileName = `sentencas_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`;

            saveAs(dataBlob, fileName);
        } catch (error) {
            console.error('Erro ao exportar sentenças:', error);
            throw error; // Propagar erro para ser tratado no componente
        }
    }
};

export namespace DocumentApi {
    export namespace FindDocuments {
        export type Params = {
            limit?: number;
            page?: number;
            status?: number;
            id?: string;
            text?: string;
            classification?: number;
            idCompany: string;
        };
        export type Document = {
            id: string;
            status: {
                id: number;
                name: string;
            };
            mandatoryResources: {
                id: number | undefined;
                name: string | undefined;
            }[];
            documentClassifications: {
                id: number;
                confidence: {
                    id: number;
                    name: string;
                } | null;
                classification: {
                    id: number;
                    name: string;
                } | null;
            } | null;
            metadata: any;
            text: string;
            createdAt: string;
        }
        export type Response = {
            documents: Document[];
            pagination: {
                page: number;
                limit: number;
                total: number;
            };
        };
    }

    export namespace AnalyzeDocument {
        export type Params = {
            file: File;
            idCompany: string;
        };
        export type Response = {
            id: string;
        };
    }
}

type ApiKey = {
    service: {
        id: number;
        name: string;
    }
    apiKey: string;
    createdAt: Date;
}