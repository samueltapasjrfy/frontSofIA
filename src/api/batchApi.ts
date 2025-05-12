import { http } from "./fetch";

export const BatchApi = {
    findAll: async (params: BatchApi.FindAll.Params): Promise<BatchApi.FindAll.Response> => {
        try {

            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.set(key, value.toString());
                }
            });

            const response = await http.get<BatchApi.FindAll.Response>(`/Batch?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    findOne: async (id: string): Promise<BatchApi.FindOne.Response> => {
        const response = await http.get<BatchApi.FindOne.Response>(`/Batch/${id}`);
        return response.data;
    }
};

export namespace BatchApi {
    export namespace FindAll {
        export type Params = {
            page?: number;
            limit?: number;
            status?: number;
            type?: number;
            noPagination?: boolean;
        };

        export type Response = {
            batches: Batch[];
            total: number;
        };
    }

    export namespace FindOne {
        export type Response = {
            data: Batch
        };
    }
    export type Batch = {
        id: string;
        status: {
            id: number;
            value: string;
        };
        type: {
            id: number;
            value: string;
        };
        total: number;
        createdAt: string;
    }
}
