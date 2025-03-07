export type APIResponse<T = any> = {
    data: T;
    message: string;
    error: boolean;
}