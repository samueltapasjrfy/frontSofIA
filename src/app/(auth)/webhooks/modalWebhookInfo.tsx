import { WebhooksApi } from "@/api/webhooksApi";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ModalWebhookInfoProps = {
    isModalOpen: boolean;
    setIsModalOpen: (isModalOpen: boolean) => void;
    webhook: WebhooksApi.History.Find.Log | null;
}
export default function ModalWebhookInfo({ isModalOpen, setIsModalOpen, webhook }: ModalWebhookInfoProps) {
    return (
        <Dialog
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
        >
            <DialogContent
                className="max-w-full sm:max-w-[600px] md:max-w-[800px] modal-import-data">
                <DialogHeader className="">
                    <DialogTitle >Informações do disparo</DialogTitle>
                </DialogHeader>
                {webhook && (
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className="flex items-baseline gap-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">POST</Badge>
                                        <span className="text-sm text-gray-500">{webhook.url}</span>
                                    </div>
                                    <Badge variant={webhook.responseCode.startsWith('2') ? 'success' : 'error'}>{webhook.responseCode}</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-2">
                                    <Badge variant="outline">Requisição</Badge>
                                    <div className="flex flex-col gap-2 bg-gray-100 p-2 rounded-md">
                                        <pre>{JSON.stringify(webhook.requestBody, null, 2)}</pre>
                                    </div>
                                    <Badge variant="outline">Resposta</Badge>
                                    <div className="flex flex-col gap-2 bg-gray-100 p-2 rounded-md">
                                        <pre>{JSON.stringify(webhook.responseBody, null, 2)}</pre>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
            </DialogContent>
        </Dialog>
    )
}