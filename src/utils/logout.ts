import { queryClient } from "@/lib/reactQuery";

export function logout() {
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('token');
    localStorage.removeItem('companyName');
    queryClient.clear();
    window.location.href = '/login';
}
