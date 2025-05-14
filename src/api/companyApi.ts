import { http } from "./fetch";
import { APIResponse } from "./response";

export const CompanyApi = {

    saveCompany: async (params: CompanyApi.SaveCompany.Params): Promise<APIResponse<CompanyApi.SaveCompany.Response>> => {
        const response = await http.post<CompanyApi.SaveCompany.Response>('/companies', params);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    findUsers: async (params?: CompanyApi.FindUsers.Params): Promise<APIResponse<CompanyApi.FindUsers.Response>> => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.name) queryParams.append('name', params.name);

        const url = `/Companies/Users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await http.get<CompanyApi.FindUsers.Response>(url);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    findUser: async (id: string): Promise<APIResponse<CompanyApi.FindUser.Response>> => {
        const response = await http.get<CompanyApi.FindUser.Response>(`/Companies/Users/${id}`);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },
};

export namespace CompanyApi {
    export namespace SaveCompany {
        export type Params = {
            name: string;
            document: string;
            info?: {
                description?: string;
            };
        };
        export type Response = {
            id: string;
            name: string;
        };
    }

    export namespace FindUsers {
        export type Params = {
            limit?: number;
            page?: number;
            name?: string;
        };
        export type Response = {
            users: {
                id: string;
                name: string;
                email: string;
                status: { id: number; value: string };
                createdAt: string;
            }[];
            total: number;
            pagination: {
                total: number;
                page: number;
                limit: number;
                pages: number;
            };
        };
    }

    export namespace FindUser {
        export type Response = {
            id: string;
            name: string;
            email: string;
            status: { id: number; value: string };
            createdAt: string;
        };
    }
}