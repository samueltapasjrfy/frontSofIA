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
    
}