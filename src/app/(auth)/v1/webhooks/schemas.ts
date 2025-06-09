import { z } from "zod";

const urlRegex = /^https?:\/\/.+/;

export const webhookFormSchema = z.object({
    url: z.string()
        .min(1, "URL é obrigatória")
        .regex(urlRegex, "URL deve começar com http:// ou https://"),
    authenticationType: z.enum(['bearer', 'basic', 'apiKey'] as const),
    bearerToken: z.string().optional()
        .refine(token => {
            if (token === undefined) return true;
            return token.length > 0;
        }, "Token é obrigatório para autenticação Bearer"),
    username: z.string().optional()
        .refine(username => {
            if (username === undefined) return true;
            return username.length > 0;
        }, "Username é obrigatório para autenticação Basic"),
    password: z.string().optional()
        .refine(password => {
            if (password === undefined) return true;
            return password.length > 0;
        }, "Password é obrigatório para autenticação Basic"),
    apiKeyToken: z.string().optional()
        .refine(token => {
            if (token === undefined) return true;
            return token.length > 0;
        }, "Token é obrigatório para autenticação API Key"),
    apiKeyHeader: z.string().optional()
        .refine(header => {
            if (header === undefined) return true;
            return header.length > 0;
        }, "Nome do header é obrigatório para autenticação API Key"),
}).refine((data) => {
    if (data.authenticationType === 'bearer') {
        return !!data.bearerToken;
    }
    if (data.authenticationType === 'basic') {
        return !!data.username && !!data.password;
    }
    if (data.authenticationType === 'apiKey') {
        return !!data.apiKeyToken && !!data.apiKeyHeader;
    }
    return true;
}, {
    message: "Preencha todos os campos obrigatórios para o tipo de autenticação selecionado",
    path: ["authenticationType"]
});

export type WebhookFormData = z.infer<typeof webhookFormSchema>; 