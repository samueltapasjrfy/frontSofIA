import { ProcessApi } from "@/api/processApi";
import dayjs from "dayjs";
import { Table } from "../../ui/table";
import { TableHeader } from "../../ui/table";
import { TableRow } from "../../ui/table";
import { TableHead } from "../../ui/table";
import { TableBody } from "../../ui/table";
import { TableCell } from "../../ui/table";
import { TruncateText } from "@/components/truncateText";
import { useState } from "react";
import { ChevronLeft, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import PopConfirm from "@/components/ui/popconfirm";
import { Badge } from "@/components/ui/badge";
import { AudiencesApi } from "@/api/audiencesApi";
import { toast } from "sonner";
import { queryClient } from "@/lib/reactQuery";
import { QUERY_KEYS } from "@/constants/cache";

type ProcessInfoModalAudiencesProps = {
    audiences: ProcessApi.FindAll.Process['audiences'];
}
export const ProcessInfoModalAudiences = ({ audiences }: ProcessInfoModalAudiencesProps) => {
    const [selectedText, setSelectedText] = useState("");

    const getApprovalBadge = (approved: boolean | null) => {
        if (approved === null) {
            return <Badge variant="secondary">Pendente</Badge>;
        }
        if (approved) {
            return <Badge variant="default" className="bg-green-500">Aprovada</Badge>;
        }
        return <Badge variant="destructive">Reprovada</Badge>;
    };

    const updateStatusBulk = async (data: AudiencesApi.UpdateStatusBulk.Params) => {
        try {
            console.log(data);
            const response = await AudiencesApi.updateStatusBulk(data);

            toast.success(response.data.message);
            // Invalidate audiences queries to refresh data
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIENCES] });
            queryClient.refetchQueries({ queryKey: [QUERY_KEYS.AUDIENCES_TOTAL_PENDING] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESSES] });
            return response;
        } catch (e) {
            toast.error('Erro ao atualizar status das audiências');
        }
    }

    return (
        <div className="grid gap-4 py-4">
            {selectedText ? (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setSelectedText("")}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-sm text-gray-500">
                        {selectedText}
                    </div>
                </div>
            ) : (
                audiences.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 border-b">
                                <TableHead>Data</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Motivo de cancelamento</TableHead>
                                <TableHead>Aprovação</TableHead>
                                <TableHead>Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {audiences.map((audience) => (
                                <TableRow key={new Date().getTime() + Math.random()}>
                                    <TableCell>{dayjs(audience.date).format("DD/MM/YYYY")}</TableCell>
                                    <TableCell>
                                        <TruncateText
                                            text={audience.description || ""}
                                            maxLength={50}
                                            onClick={() => {
                                                setSelectedText(audience.description || "");
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{audience.type?.name || "-"}</TableCell>
                                    <TableCell>{audience.status?.name || "-"}</TableCell>
                                    <TableCell>{audience.cancellationReason || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center">
                                            {getApprovalBadge(audience.approved)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-gray-600 whitespace-nowrap">
                                            <PopConfirm
                                                modal
                                                title="Aprovar"
                                                onConfirm={async () => updateStatusBulk({
                                                    ids: [audience.id],
                                                    status: 'approve'
                                                })}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    title="Confirmar aprovação?"
                                                    disabled={audience.approved === true}

                                                >
                                                    <ThumbsUp className="h-4 w-4" />
                                                </Button>
                                            </PopConfirm>
                                            <PopConfirm
                                                modal
                                                title="Reprovar"
                                                onConfirm={async () => updateStatusBulk({
                                                    ids: [audience.id],
                                                    status: 'reprove'
                                                })}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    title="Reprovar"
                                                    disabled={audience.approved === false}
                                                >
                                                    <ThumbsDown className="h-4 w-4" />
                                                </Button>
                                            </PopConfirm>
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-sm text-gray-500">Nenhuma audiência encontrada</div>
                )
            )}
        </div>
    )
}
