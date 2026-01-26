import { http } from "./fetchv2";
import { APIResponse } from "./response";

export const OabApi = {
    find: async (): Promise<APIResponse<OabApi.Find.Response>> => {
        const response = await http.get<OabApi.Find.Response>('/Oab');
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    save: async (data: OabApi.Save.Params): Promise<APIResponse<OabApi.Save.Response>> => {
        const response = await http.post<OabApi.Save.Response>('/Oab', data);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },

    delete: async (id: string): Promise<APIResponse<void>> => {
        const response = await http.delete<void>(`/Oab/${id}`);
        return {
            data: response.data,
            message: response.message,
            error: response.error
        };
    },
}

export namespace OabApi {
    export namespace Find {
        export type Response = {
            oabs: Array<{
                id: string;
                oab: string;
                state: string;
                lawyer: string;
                registrationDate: string;
                totalPublications: number;
                status: number;
            }>;
        };
    }

    export namespace Save {
        export type Params = {
            oabs: Array<{
                oab: string;
                state: number;
                name: string;
            }>;
        };

        export type Response = Array<{
            id: string;
            oab: string;
            state: number;
            name: string;
            status: number;
        }>;
    }
}
