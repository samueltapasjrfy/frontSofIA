import { WebhooksApi } from "@/api/webhooksApi";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BadgeWebhookStatus from "./badgeWebhookStatus";
import { WEBHOOK_STATUS } from "@/constants/webhook";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

type ModalWebhookInfoProps = {
    isModalOpen: boolean;
    setIsModalOpen: (isModalOpen: boolean) => void;
    trigger: WebhooksApi.History.Find.Log | null;
}
export default function ModalWebhookInfo({ isModalOpen, setIsModalOpen, trigger }: ModalWebhookInfoProps) {
    const [isResending, setIsResending] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(false);

    const handleResendWebhook = async () => {
        if (!trigger) return null;
        setIsResending(true);
        console.log('Resend trigger');
        const response = await WebhooksApi.resend(trigger.id);
        toast.info(response.message || (response.error ? 'Erro ao reenviar disparo' : 'Disparo reenviado com sucesso'));
        setIsResending(false);
        setIsResendDisabled(true);
        if (response.error) return;

        trigger.status.id = WEBHOOK_STATUS.PENDING;
        trigger.status.status = 'Em processamento';
        trigger.logs.unshift({
            id: 0,
            webhook: {
                id: '-1',
                url: response.data.url,
                authenticationType: 'bearer',
                createdAt: new Date(),
            },
            responseCode: '-',
            responseBody: '',
            createdAt: new Date(),
            error: false,
        });
    }
    return (
        <Dialog
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
        >
            <DialogContent
                className="max-w-full sm:max-w-[600px] md:max-w-[800px] modal-import-data">
                <DialogHeader className="">
                    <DialogTitle className="flex items-center gap-4">
                        <span>Informações do disparo</span>
                        <BadgeWebhookStatus idStatus={trigger?.status.id ?? 1} status={trigger?.status.status ?? 'Em processamento'} />
                    </DialogTitle>
                </DialogHeader>
                {trigger?.status.id === WEBHOOK_STATUS.ERROR && (
                    <div className="flex justify-end">
                        <Button
                            className="w-[100px]"
                            variant="default"
                            size="sm"
                            onClick={handleResendWebhook}
                            loading={isResending}
                            disabled={isResendDisabled}
                        >
                            Reenviar
                        </Button>
                    </div>
                )}
                <div className="h-[500px] overflow-y-auto">
                    {trigger && trigger.logs.length > 0 && trigger.logs.map(log => (
                        <Accordion type="single" collapsible key={log.id}>
                            <AccordionItem value="item-1">
                                <AccordionTrigger>
                                    <div className="flex items-baseline gap-4 w-full">
                                        <div className="flex items-center gap-2 w-[70%] overflow-hidden">
                                            <Badge variant="outline">POST</Badge>
                                            <span className="text-sm text-gray-500">{log.webhook?.url}</span>
                                        </div>
                                        <div className="flex items-center gap-2 w-[30%]">
                                            <Badge variant={log.responseCode.startsWith('2') ? 'success' : 'error'}>{log.responseCode}</Badge>
                                            <span className="text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-col gap-2">
                                        <Badge variant="outline">Requisição</Badge>
                                        <div className="flex flex-col gap-2 bg-gray-100 p-2 rounded-md">
                                            <pre>{JSON.stringify(trigger.requestBody, null, 2)}</pre>
                                        </div>
                                        <Badge variant="outline">Resposta</Badge>
                                        <div className="flex flex-col gap-2 bg-gray-100 p-2 rounded-md">
                                            <pre>{JSON.stringify(log.responseBody, null, 2)}</pre>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}