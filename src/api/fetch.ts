import { logout } from "@/utils/logout";
import { APIResponse } from "./response";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

function getToken(): string | undefined {
    return document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1];
}

function checkAuth() {
    const token = getToken();
    if (!token) {
        logout();
        return false;
    }
    return true;
}

async function request<T>(method: string, url: string, bodyOrParams?: any): Promise<APIResponse<T>> {
    try {
        // Verifica autenticação antes de fazer a requisição
        if (!checkAuth()) {
            return {
                data: null as T,
                message: 'Usuário não autenticado',
                error: true
            };
        }

        let fullUrl = `${baseUrl}${url}`;
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Adiciona o token do cookie
        const token = getToken();
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        };

        if (method === 'GET' && bodyOrParams) {
            const queryParams = new URLSearchParams(bodyOrParams).toString();
            fullUrl += `?${queryParams}`;
        } else if (method !== 'GET' && bodyOrParams !== undefined) {
            options.body = JSON.stringify(bodyOrParams);
        }

        const response = await fetch(fullUrl, options);
        const json = await response.json();

        if (response.status === 401) {
            logout();
            return {
                data: null as T,
                message: 'Sessão expirada',
                error: true
            };
        }

        if (!response.ok) {
            return {
                data: null as T,
                message: json?.message,
                error: true
            };
        }

        return {
            data: json?.data as T,
            message: json?.message,
            error: false
        };
    } catch (error) {
        console.error('Erro na requisição:', error);
        return {
            data: null as T,
            message: 'Erro ao realizar a requisição',
            error: true
        };
    }
}

export const http = {
    get: <T = any>(url: string, params?: any) => request<T>('GET', url, params),
    post: <T = any>(url: string, body?: any) => request<T>('POST', url, body),
    put: <T = any>(url: string, body?: any) => request<T>('PUT', url, body),
    patch: <T = any>(url: string, body?: any) => request<T>('PATCH', url, body),
    delete: <T = any>(url: string) => request<T>('DELETE', url),
};
