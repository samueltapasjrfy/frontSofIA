import { WebhooksApi } from "@/api/webhooksApi";
import { WebhookFormData, webhookFormSchema } from "@/components/pages/webhooks/form/schemas";
import { toast } from "sonner";
import { ZodError } from "zod";

type WebhookHandleProps = {
    formData: WebhookFormData;
    setFormData: (formData: WebhookFormData) => void;
    isPerformingAction: "save" | "remove" | undefined;
    setIsPerformingAction: (isPerformingAction: "save" | "remove" | undefined) => void;
    isWebhookActive: boolean;
    setIsWebhookActive: (isWebhookActive: boolean) => void;
    setWebhookHistoryParams: (webhookHistoryParams: WebhooksApi.History.Find.Params) => void;
    webhookHistoryParams: WebhooksApi.History.Find.Params;
    invalidateWebhookQuery: () => void;
    invalidateWebhookHistoryQuery: () => void;
}

type AuthType = 'bearer' | 'basic' | 'apiKey';

export const webhookHandle = ({
    formData,
    setFormData,
    isPerformingAction,
    setIsPerformingAction,
    isWebhookActive,
    setIsWebhookActive,
    setWebhookHistoryParams,
    webhookHistoryParams,
    invalidateWebhookQuery,
    invalidateWebhookHistoryQuery,
}: WebhookHandleProps) => {

    const handleSaveWebhook = async () => {
        try {
            setIsPerformingAction("save");

            // Validar o formulário com Zod
            const validatedData = webhookFormSchema.parse(formData);

            let authData = {};
            switch (validatedData.authenticationType) {
                case 'bearer':
                    authData = { bearer: { token: validatedData.bearerToken } };
                    break;
                case 'basic':
                    authData = { basic: { username: validatedData.username, password: validatedData.password } };
                    break;
                case 'apiKey':
                    authData = { apiKey: { token: validatedData.apiKeyToken, header: validatedData.apiKeyHeader } };
                    break;
            }

            const response = await WebhooksApi.save({
                url: validatedData.url,
                authentication: {
                    type: validatedData.authenticationType,
                    ...authData
                }
            });

            if (response.error) {
                toast.error(response.message || "Erro ao salvar webhook");
                return;
            }

            toast.success("Webhook salvo com sucesso");
            invalidateWebhookQuery();
        } catch (error) {
            console.error(error);

            if (error instanceof ZodError) {
                // Mostrar o primeiro erro de validação
                const firstError = error.errors[0];
                toast.error(firstError.message);
            } else {
                toast.error("Erro ao salvar webhook");
            }
        } finally {
            setIsPerformingAction(undefined);
        }
    };

    const handleRemoveWebhook = async () => {
        try {
            setIsPerformingAction("remove");

            const response = await WebhooksApi.delete();

            if (response.error) {
                toast.error(response.message || "Erro ao remover webhook");
                return;
            }
            toast.success("Webhook removido com sucesso");
            invalidateWebhookQuery();
            setIsWebhookActive(false);
            setFormData({
                url: '',
                authenticationType: 'bearer',
                bearerToken: undefined,
                username: undefined,
                password: undefined,
                apiKeyToken: undefined,
                apiKeyHeader: undefined,
            });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao remover webhook");
        } finally {
            setIsPerformingAction(undefined);
        }
    };

    const handleRefresh = async () => {
        invalidateWebhookHistoryQuery()
        invalidateWebhookQuery()
        setWebhookHistoryParams({
            page: 1,
            limit: webhookHistoryParams.limit
        })
    }

    const handleChangeWebhookData = (data?: WebhooksApi.Find.Response) => {
        if (!data) return
        setIsWebhookActive(!!data.id);
        setFormData({
            url: data.url,
            authenticationType: data.authenticationType as AuthType,
            ...(data.authentication?.bearer && {
                bearerToken: data.authentication.bearer.token
            }),
            ...(data.authentication?.basic && {
                username: data.authentication.basic.username,
                password: data.authentication.basic.password
            }),
            ...(data.authentication?.apiKey && {
                apiKeyToken: data.authentication.apiKey.token,
                apiKeyHeader: data.authentication.apiKey.header
            })
        });
    }

    return {
        formData,
        setFormData,
        isPerformingAction,
        isWebhookActive,
        handleSaveWebhook,
        handleRemoveWebhook,
        handleRefresh,
        setIsWebhookActive,
        handleChangeWebhookData
    }
};
