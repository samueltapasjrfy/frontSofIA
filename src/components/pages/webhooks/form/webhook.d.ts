export interface WebhookFormData {
    url: string;
    authenticationType: AuthType;
    bearerToken?: string;
    username?: string;
    password?: string;
    apiKeyToken?: string;
    apiKeyHeader?: string;
}
