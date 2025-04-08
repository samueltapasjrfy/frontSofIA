import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";
import { WebhookFormData } from "./webhook";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { Textarea } from "@/components/ui/textarea";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";

type FormWebhookProps = {
    formData: WebhookFormData;
    setFormData: (formData: WebhookFormData) => void;
    isLoading: boolean;
    isPerformingAction: "save" | "remove" | undefined;
    handleSaveWebhook: () => void;
    handleRemoveWebhook: () => void;
    isActive: boolean;
}
export default function FormWebhook({ formData, setFormData, isLoading, isPerformingAction, handleSaveWebhook, handleRemoveWebhook, isActive }: FormWebhookProps) {
    return (
        <div className="bg-white border rounded-lg shadow-sm px-4">
            {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
            ) : (
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-semibold">
                                    Configuração do Webhook
                                </h2>
                                <Badge className={cn(
                                    isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                )}>
                                    {isActive ? "Cadastrado" : "Não cadastrado"}
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL do Webhook
                                    </label>
                                    <Input
                                        placeholder="Insira a URL do webhook"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        disabled={!!isPerformingAction}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Button
                                            variant={formData.authenticationType === 'bearer' ? 'default' : 'outline'}
                                            onClick={() => setFormData({ ...formData, authenticationType: 'bearer' })}
                                            disabled={!!isPerformingAction}
                                            className={cn(
                                                formData.authenticationType === 'bearer' && "bg-primary-blue hover:bg-blue-700"
                                            )}
                                        >
                                            Bearer Token
                                        </Button>
                                        <Button
                                            variant={formData.authenticationType === 'basic' ? 'default' : 'outline'}
                                            onClick={() => setFormData({ ...formData, authenticationType: 'basic' })}
                                            disabled={!!isPerformingAction}
                                            className={cn(
                                                formData.authenticationType === 'basic' && "bg-primary-blue hover:bg-blue-700"
                                            )}
                                        >
                                            Basic Auth
                                        </Button>
                                        <Button
                                            variant={formData.authenticationType === 'apiKey' ? 'default' : 'outline'}
                                            onClick={() => setFormData({ ...formData, authenticationType: 'apiKey' })}
                                            disabled={!!isPerformingAction}
                                            className={cn(
                                                formData.authenticationType === 'apiKey' && "bg-primary-blue hover:bg-blue-700"
                                            )}
                                        >
                                            API Token
                                        </Button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Token ou Credenciais
                                        </label>
                                        {formData.authenticationType === 'bearer' && (
                                            <Textarea
                                                placeholder="Insira o token para autenticação"
                                                value={formData.bearerToken}
                                                onChange={(e) => setFormData({ ...formData, bearerToken: e.target.value })}
                                                className="min-h-[120px]"
                                            />
                                        )}
                                        {formData.authenticationType === 'basic' && (
                                            <div className="space-y-2">
                                                <Input
                                                    placeholder="Username"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    disabled={!!isPerformingAction}
                                                />
                                                <Input
                                                    type="password"
                                                    placeholder="Password"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    disabled={!!isPerformingAction}
                                                />
                                            </div>
                                        )}
                                        {formData.authenticationType === 'apiKey' && (
                                            <div className="space-y-2">
                                                <Input
                                                    placeholder="Nome do header"
                                                    value={formData.apiKeyHeader}
                                                    onChange={(e) => setFormData({ ...formData, apiKeyHeader: e.target.value })}
                                                    disabled={!!isPerformingAction}
                                                />
                                                <Input
                                                    placeholder="Token"
                                                    value={formData.apiKeyToken}
                                                    onChange={(e) => setFormData({ ...formData, apiKeyToken: e.target.value })}
                                                    disabled={!!isPerformingAction}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSaveWebhook}
                                        className="bg-primary-blue hover:bg-blue-700"
                                        disabled={!!isPerformingAction}
                                        loading={isPerformingAction === "save"}
                                    >
                                        Salvar Webhook
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleRemoveWebhook}
                                        className="text-gray-700 hover:bg-gray-100"
                                        disabled={!!isPerformingAction}
                                        loading={isPerformingAction === "remove"}
                                    >
                                        Remover Webhook
                                    </Button>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
        </div>
    )
}