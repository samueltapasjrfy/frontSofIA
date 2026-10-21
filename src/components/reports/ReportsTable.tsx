"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { DateRange } from "react-day-picker";
import { Download, RefreshCw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { ReportsApi } from "@/api/reportsApi";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/dateRangePicker";
import { Pagination } from "@/components/pagination";
import { useReports } from "@/hooks/useReports";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
    audiencias: "Audiências",
    citacoes: "Citações",
};

const STATUS_LABELS: Record<string, string> = {
    pendente: "Pendente",
    iniciado: "Iniciado",
    falha: "Falha",
    finalizado: "Finalizado",
};

const STATUS_CLASS: Record<string, string> = {
    pendente: "bg-amber-50 text-amber-700 border-amber-200",
    iniciado: "bg-blue-50 text-blue-700 border-blue-200",
    falha: "bg-red-50 text-red-700 border-red-200",
    finalizado: "bg-green-50 text-green-700 border-green-200",
};

const labelOf = (labels: Record<string, string>, name: string) => labels[name] || name;

export function ReportsTable() {
    const { params, reportsQuery, metadataQuery, changeFilter, invalidateQuery } = useReports();
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const applyDate = (range: DateRange | undefined) => {
        setDate(range);
        if (range?.from && range?.to) {
            changeFilter({
                dateStart: dayjs(range.from).format("YYYY-MM-DD"),
                dateEnd: dayjs(range.to).format("YYYY-MM-DD"),
                page: 1,
            });
            return;
        }
        changeFilter({
            dateStart: undefined,
            dateEnd: undefined,
            page: 1,
        });
    };

    const clearFilters = () => {
        setDate(undefined);
        changeFilter({
            page: 1,
            dateStart: undefined,
            dateEnd: undefined,
            idType: undefined,
            idStatus: undefined,
        });
    };

    const download = async (id: string) => {
        setDownloadingId(id);
        try {
            const response = await ReportsApi.download(id);
            if (response.error || !response.data?.url) {
                toast.error(response.message || "Erro ao baixar relatório");
                return;
            }
            window.open(response.data.url, "_blank");
        } catch {
            toast.error("Erro ao baixar relatório");
        } finally {
            setDownloadingId(null);
        }
    };

    const reports = reportsQuery.data?.reports || [];

    return (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <label htmlFor="report-date" className="block text-sm font-medium text-gray-700 mb-1">
                            Período
                        </label>
                        <DatePickerWithRange
                            id="report-date"
                            date={date}
                            onChange={(newDate) => applyDate(newDate as DateRange | undefined)}
                        />
                    </div>
                    <div>
                        <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo
                        </label>
                        <select
                            id="report-type"
                            value={params.idType || ""}
                            onChange={(event) => changeFilter({
                                idType: event.target.value ? Number(event.target.value) : undefined,
                                page: 1,
                            })}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="">Todos</option>
                            {metadataQuery.data?.types.map(type => (
                                <option key={type.id} value={type.id}>{labelOf(TYPE_LABELS, type.name)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="report-status" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            id="report-status"
                            value={params.idStatus || ""}
                            onChange={(event) => changeFilter({
                                idStatus: event.target.value ? Number(event.target.value) : undefined,
                                page: 1,
                            })}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="">Todos</option>
                            {metadataQuery.data?.statuses.map(status => (
                                <option key={status.id} value={status.id}>{labelOf(STATUS_LABELS, status.name)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <Button variant="outline" size="sm" onClick={clearFilters} className="flex items-center gap-1">
                            <X className="h-4 w-4" />
                            Limpar Filtros
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => invalidateQuery()}
                            className="flex items-center gap-1"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Atualizar
                        </Button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 border-b">
                            <TableHead>Data</TableHead>
                            <TableHead>Solicitante</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Arquivo</TableHead>
                            <TableHead className="w-16" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportsQuery.isError ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    Erro ao carregar relatórios
                                </TableCell>
                            </TableRow>
                        ) : reportsQuery.isFetching && reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    <div className="flex justify-center items-center">
                                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                                        Carregando relatórios...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <Search className="h-8 w-8 mb-2 text-gray-400" />
                                        <p>Nenhum relatório encontrado</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : reports.map((report, index) => (
                            <TableRow
                                key={report.id}
                                className={cn(
                                    "hover:bg-gray-50 transition-colors",
                                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                                )}
                            >
                                <TableCell className="py-3">
                                    {report.createdAt ? dayjs(report.createdAt).format("DD/MM/YYYY HH:mm") : "-"}
                                </TableCell>
                                <TableCell className="py-3">{report.requesterName || "-"}</TableCell>
                                <TableCell className="py-3">{labelOf(TYPE_LABELS, report.type.name)}</TableCell>
                                <TableCell className="py-3">
                                    <span
                                        title={report.errorMessage || undefined}
                                        className={cn(
                                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                            STATUS_CLASS[report.status.name] || "bg-gray-50 text-gray-700 border-gray-200",
                                        )}
                                    >
                                        {labelOf(STATUS_LABELS, report.status.name)}
                                    </span>
                                </TableCell>
                                <TableCell className="py-3">{report.fileName || "-"}</TableCell>
                                <TableCell className="py-3">
                                    {report.status.id === 4 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Baixar"
                                            disabled={downloadingId === report.id}
                                            onClick={() => download(report.id)}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                total={reportsQuery.data?.total || 0}
                pagination={{
                    page: params.page || 1,
                    limit: params.limit || 10,
                }}
                setPagination={({ page, limit }) => changeFilter({ page, limit })}
            />
        </div>
    );
}
