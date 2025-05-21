"use client";

import { useWebhook } from "@/hooks/useWebhook";
import FormWebhook from "@/components/pages/webhooks/form/formWebhook";
import TableWebhook from "@/components/pages/webhooks/tableWebhook";
import { TableButtons } from "@/components/tableButtons";
import { webhookHandle } from "./webhookHandle";
import { useEffect, useState } from "react";
import { WebhookFormData } from "@/components/pages/webhooks/form/schemas";

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

  const {
    handleSaveWebhook,
    handleRemoveWebhook,
    handleRefresh,
    handleChangeWebhookData,
  } = webhookHandle({
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
  });

  useEffect(() => {
    handleChangeWebhookData(getWebhookQuery.data);
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