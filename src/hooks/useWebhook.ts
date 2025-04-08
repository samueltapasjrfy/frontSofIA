import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WebhooksApi } from "@/api/webhooksApi";
import { QUERY_KEYS } from "@/constants/cache";
import { useState } from "react";

export function useWebhook() {
    const [webhookHistoryParams, setWebhookHistoryParams] = useState<WebhooksApi.History.Find.Params>({
        page: 1,
        limit: 10
    });
    const queryClient = useQueryClient();

    const getWebhookQuery = useQuery({
        queryKey: [QUERY_KEYS.WEBHOOK],
        queryFn: async () => {
            try {

                const response = await WebhooksApi.find(true);
                if (response.error) {
                    const error = new Error(response.message) as Error & { status?: number };
                    throw error;
                }
                return response.data;
            } catch (error) {
                throw error;
            }
        },
        retry: (failureCount, error: Error & { status?: number }) => {
            if (error.message.toLowerCase().includes('webhook não encontrado')) return false;
            return failureCount < 3;
        }
    });

    const getWebhookHistoryQuery = useQuery({
        queryKey: [QUERY_KEYS.WEBHOOK_HISTORY],
        queryFn: async () => {
            const response = await WebhooksApi.history.find(webhookHistoryParams);
            if (response.error) {
                throw new Error(response.message);
            }
            return response.data;
        }
    });

    const invalidateWebhookQuery = () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WEBHOOK] });
    };

    const invalidateWebhookHistoryQuery = () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WEBHOOK_HISTORY] });
    };

    return {
        getWebhookQuery,
        invalidateWebhookQuery,
        getWebhookHistoryQuery,
        invalidateWebhookHistoryQuery,
        setWebhookHistoryParams,
        webhookHistoryParams
    };
} 