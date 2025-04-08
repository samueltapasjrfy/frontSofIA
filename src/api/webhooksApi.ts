import { http } from "./fetch";
import { APIResponse } from "./response";

export const WebhooksApi = {
    save: async (data: WebhooksApi.Save.Params): Promise<APIResponse<WebhooksApi.Save.Response>> => {
        const response = await http.post<WebhooksApi.Save.Response>('/Webhook', data);
        console.log(response);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    find: async (includeAuth?: boolean): Promise<APIResponse<WebhooksApi.Find.Response>> => {
        const params = new URLSearchParams();
        if (includeAuth !== undefined) params.set('includeAuth', includeAuth?.toString() || 'false');
        const response = await http.get<WebhooksApi.Find.Response>(`/Webhook?${params.toString()}`);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    delete: async (): Promise<APIResponse<void>> => {
        const response = await http.delete<void>('/Webhook');
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    history: {
        find: async (params: WebhooksApi.History.Find.Params): Promise<APIResponse<WebhooksApi.History.Find.Response>> => {
            const queryParams = new URLSearchParams();
            params.page && queryParams.set('page', params.page.toString());
            params.limit && queryParams.set('limit', params.limit.toString());
            params.startDate && queryParams.set('startDate', params.startDate);
            params.endDate && queryParams.set('endDate', params.endDate);
            params.status && queryParams.set('status', params.status.toString());

            const response = await http.get<WebhooksApi.History.Find.Response>(`/Webhook/History?${queryParams.toString()}`);
            return {
                data: response.data,
                message: response.message,
                error: response.error
            };
        }
    }
}

export namespace WebhooksApi {
    export namespace Save {
        export type Params = {
            url: string;
            authentication: {
                type: 'bearer' | 'basic' | 'apiKey';
                bearer?: { token: string };
                basic?: { username: string; password: string };
                apiKey?: { token: string; header: string };
            };
        };
        export type Response = {
            id: string;
            url: string;
            authenticationType: string;
        }
    }

    export namespace Find {
        export type Response = {
            id: string;
            url: string;
            authenticationType: string;
            authentication?: {
                bearer?: { token: string };
                basic?: { username: string; password: string };
                apiKey?: { token: string; header: string };
            };
            createdAt: Date;
        }
    }

    export namespace History {
        export namespace Find {
            export type Params = {
                page: number;
                limit: number;
                startDate?: string;
                endDate?: string;
                status?: number;
            }

            export type Log = {
                id: string;
                url: string;
                authenticationType: string;
                createdAt: string;
                responseCode: string;
                responseBody: any;
                requestBody: any;
                error: boolean;
            }
            export type Response = {
                logs: Log[];
                total: number;
            }
        }
    }
}

