import { WebhooksApi } from "@/api/webhooksApi";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/index";
import { cn } from "@/utils/cn";
import { Info, Loader2 } from "lucide-react";
import { useState } from "react";
import ModalWebhookInfo from "./modalWebhookInfo";
import BadgeWebhookStatus from "./badgeWebhookStatus";
type TableWebhookProps = {
    history: WebhooksApi.History.Find.Log[];
    total: number;
    isLoading: boolean;
    pagination: {
        page: number;
        limit: number;
    };
    setPagination: (pagination: { page: number, limit: number }) => void;
}
export default function TableWebhook({ history, isLoading, pagination, setPagination, total }: TableWebhookProps) {
    const [selectedItem, setSelectedItem] = useState<WebhooksApi.History.Find.Log | null>(null);

    return (
        <div className="overflow-x-auto p-4 ">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50 border-b">
                        <TableHead className="font-semibold text-gray-700 py-3">Data</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Tipo</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Resposta</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                <div className="flex items-center justify-center">
                                    <Loader2 size="24" className="animate-spin" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        history.length > 0 ? (
                            history.map((item, index) => (
                                <TableRow
                                    key={index}
                                    className={cn(
                                        "hover:bg-gray-50 transition-colors",
                                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                    )}
                                >
                                    <TableCell className="py-3">
                                        {new Date(item.createdAt).toLocaleString('pt-BR')}
                                    </TableCell>
                                    <TableCell className="py-3">
                                        {item.type.type}
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Badge variant={item.logs?.[0]?.error ? 'error' : 'success'}>
                                            {item.logs?.[0]?.responseCode}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <BadgeWebhookStatus idStatus={item.status.id} status={item.status.status} />
                                    </TableCell>
                                    <TableCell className="py-3" style={{ width: '36px' }}>
                                        <Button variant="outline" size="icon" onClick={() => {
                                            setSelectedItem(item)
                                        }}>
                                            <Info size="16" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">Nenhum histórico encontrado</TableCell>
                            </TableRow>
                        )
                    )}
                </TableBody>
            </Table>
            <Pagination
                total={total}
                pagination={{
                    page: pagination.page,
                    limit: pagination.limit
                }}
                setPagination={({ page, limit }) => {
                    setPagination({
                        page,
                        limit
                    });
                }}
            />
            <ModalWebhookInfo
                isModalOpen={!!selectedItem}
                setIsModalOpen={(isModalOpen) => {
                    if (!isModalOpen) {
                        setSelectedItem(null);
                    }
                }}
                trigger={selectedItem}
            />
        </div>
    )
}