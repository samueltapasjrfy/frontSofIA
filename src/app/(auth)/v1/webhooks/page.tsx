"use client";

import { useState, useEffect } from "react";
import { WebhooksApi } from "@/api/webhooksApi";
import { toast } from "sonner";
import { useWebhook } from "@/hooks/useWebhook";
import FormWebhook from "./formWebhook";
import TableWebhook from "./tableWebhook";
import { webhookFormSchema, WebhookFormData } from "./schemas";
import { ZodError } from "zod";
import { TableButtons } from "@/components/tableButtons";

type AuthType = 'bearer' | 'basic' | 'apiKey';

export default function WebhooksPage() {
  const [formData, setFormData] = useState<WebhookFormData>({
    url: '',
    authenticationType: 'bearer',
  });

  const [isPerformingAction, setIsPerformingAction] = useState<"save" | "remove" | undefined>(undefined);
  const [isWebhookActive, setIsWebhookActive] = useState(false);

  const {
    getWebhookQuery,
    getWebhookHistoryQuery,
    setWebhookHistoryParams,
    webhookHistoryParams,
    invalidateWebhookQuery,
    invalidateWebhookHistoryQuery,
  } = useWebhook();

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

  useEffect(() => {
    if (!getWebhookQuery.data) return
    setIsWebhookActive(!!getWebhookQuery.data.id);
    setFormData({
      url: getWebhookQuery.data.url,
      authenticationType: getWebhookQuery.data.authenticationType as AuthType,
      ...(getWebhookQuery.data.authentication?.bearer && {
        bearerToken: getWebhookQuery.data.authentication.bearer.token
      }),
      ...(getWebhookQuery.data.authentication?.basic && {
        username: getWebhookQuery.data.authentication.basic.username,
        password: getWebhookQuery.data.authentication.basic.password
      }),
      ...(getWebhookQuery.data.authentication?.apiKey && {
        apiKeyToken: getWebhookQuery.data.authentication.apiKey.token,
        apiKeyHeader: getWebhookQuery.data.authentication.apiKey.header
      })
    });
  }, [getWebhookQuery.data]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Configuração de Webhooks</h1>
        <p className="text-gray-600">Gerencie os webhooks e veja o histórico de disparos.</p>
      </div>

      <FormWebhook
        formData={formData}
        setFormData={setFormData}
        isLoading={getWebhookQuery.isLoading}
        handleSaveWebhook={handleSaveWebhook}
        handleRemoveWebhook={handleRemoveWebhook}
        isPerformingAction={isPerformingAction}
        isActive={isWebhookActive}
      />

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Histórico de Webhooks Disparados</h2>
          <TableButtons onRefresh={handleRefresh} />
        </div>

        <div className="overflow-x-auto">
          <TableWebhook
            history={getWebhookHistoryQuery.data?.data || []}
            isLoading={getWebhookHistoryQuery.isLoading}
            pagination={{
              page: webhookHistoryParams.page,
              limit: webhookHistoryParams.limit
            }}
            setPagination={setWebhookHistoryParams}
            total={getWebhookHistoryQuery.data?.total || 0}
          />
        </div>
      </div>
    </div>
  );
} 