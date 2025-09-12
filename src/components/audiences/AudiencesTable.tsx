"use client";

import { useState, ReactNode, useRef, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    RefreshCw,
    Search,
    X,
    ThumbsUp,
    ThumbsDown,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { toast } from "sonner";
import { Pagination } from "../pagination";
import { useAudiences } from "@/hooks/useAudiences";
import { TableButtons } from "../tableButtons";
import { DatePickerWithRange } from "../dateRangePicker";
import { DateRange } from "react-day-picker";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TruncateText } from "../truncateText";
import PopConfirm from "../ui/popconfirm";
import ModalViewText from "../modalViewText";
import { AudiencesApi } from "@/api/audiencesApi";

dayjs.locale("pt-br");

interface AudiencesTableProps {
    onRefresh: () => Promise<void>;
    className?: string;
}

// Interface para definir a estrutura de cada coluna
interface Column {
    key: string;
    label: string;
    className?: string;
    render: (audience: any) => ReactNode;
}

export function AudiencesTable({
    onRefresh,
    className,
}: AudiencesTableProps) {
    const [filters, setFilters] = useState<AudiencesApi.FindAll.Params>({});
    const [showFilters, setShowFilters] = useState(false);
    const { getAudiencesQuery, changeFilter, audienceParams, updateStatusBulk } = useAudiences(1, 10);
    const [selectedAudiences, setSelectedAudiences] = useState<Map<string, { id: string; cnj: string }>>(new Map());
    const [isPerformingAction, setIsPerformingAction] = useState(false);
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [selectedText, setSelectedText] = useState("");

    // Funções para gerenciar a seleção de audiências
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const currentPageAudiences = getAudiencesQuery.data?.audiences || [];
            setSelectedAudiences(prev => {
                const newMap = new Map(prev);
                currentPageAudiences.forEach(a => {
                    newMap.set(a.id, { id: a.id, cnj: a.process?.cnj || "" });
                });
                return newMap;
            });
        } else {
            const currentPageIds = getAudiencesQuery.data?.audiences.map(a => a.id) || [];
            setSelectedAudiences(prev => {
                const newMap = new Map(prev);
                currentPageIds.forEach(id => newMap.delete(id));
                return newMap;
            });
        }
    };

    const handleSelectAudience = (audienceId: string, checked: boolean) => {
        const audience = getAudiencesQuery.data?.audiences.find(a => a.id === audienceId);
        if (!audience) return;

        setSelectedAudiences(prev => {
            const newMap = new Map(prev);
            if (checked) {
                newMap.set(audienceId, { id: audience.id, cnj: audience.process?.cnj || "" });
            } else {
                newMap.delete(audienceId);
            }
            return newMap;
        });
    };

    // Verificar se todos os itens da página atual estão selecionados
    const currentPageIds = getAudiencesQuery.data?.audiences.map(a => a.id) || [];
    const isAllCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedAudiences.has(id));
    const isSomeSelected = currentPageIds.some(id => selectedAudiences.has(id));

    // Funções para ações em lote
    const handleBulk = async (approved: boolean) => {
        try {
            setIsPerformingAction(true);
            const selectedAudiencesArray = Array.from(selectedAudiences.values());
            const ids = selectedAudiencesArray.map(a => a.id);

            await updateStatusBulk({
                ids,
                status: approved ? 'approve' : 'reprove'
            });

        } catch (error) {
            setIsPerformingAction(false);
        }
        finally {
            setIsPerformingAction(false);
            setSelectedAudiences(new Map());
        }
    };


    const getApprovalBadge = (approved: boolean | null) => {
        if (approved === null) {
            return <Badge variant="secondary">Pendente</Badge>;
        }
        if (approved) {
            return <Badge variant="default" className="bg-green-500">Aprovada</Badge>;
        }
        return <Badge variant="destructive">Reprovada</Badge>;
    };

    // Definição das colunas da tabela
    const columns: Column[] = [
        {
            key: 'select',
            label: '',
            className: 'font-semibold text-gray-700 py-3 w-[5%]',
            render: (audience) => (
                <input
                    type="checkbox"
                    checked={selectedAudiences.has(audience.id)}
                    onChange={(e) => handleSelectAudience(audience.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
            )
        },
        {
            key: 'cnj',
            label: 'CNJ',
            className: 'font-semibold text-gray-700 py-3 w-[16%]',
            render: (audience) => (
                <span className="font-medium text-gray-700" style={{ wordBreak: 'break-all' }}>
                    {audience.process?.cnj || "-"}
                </span>
            )
        },
        {
            key: 'date',
            label: 'Data',
            className: 'font-semibold text-gray-700 py-3 w-[15%]',
            render: (audience) => (
                <span className="font-medium text-gray-700">
                    {audience.date ? dayjs(audience.date).format("DD/MM/YYYY HH:mm") : "-"}
                </span>
            )
        },
        {
            key: 'location',
            label: 'Local',
            className: 'font-semibold text-gray-700 py-3 w-[20%]',
            render: (audience) => (
                <span className="font-medium text-gray-700" style={{ wordBreak: 'break-all' }}>
                    {audience.location}
                </span>
            )
        },
        {
            key: 'description',
            label: 'Descrição',
            className: 'font-semibold text-gray-700 py-3 w-[25%]',
            render: (audience) => (
                <span className="font-medium text-gray-700" style={{ wordBreak: 'break-all' }}>
                    <TruncateText
                        text={audience.description || ""}
                        maxLength={50}
                        onClick={() => {
                            setSelectedText(audience.description || "");
                        }}
                    />
                </span>
            )
        },
        {
            key: 'type',
            label: 'Tipo',
            className: 'font-semibold text-gray-700 py-3 w-[10%]',
            render: (audience) => (
                <span className="font-medium text-gray-700">
                    {audience.type?.type || "-"}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            className: 'font-semibold text-gray-700 py-3 w-[10%]',
            render: (audience) => (
                <span className="font-medium text-gray-700">
                    {audience.status?.status || "-"}
                </span>
            )
        },

        {
            key: 'approved',
            label: 'Aprovação',
            className: 'font-semibold text-gray-700 text-center w-[10%] py-3',
            render: (audience) => {
                return (
                    <div className="flex items-center justify-center">
                        {getApprovalBadge(audience.approved)}
                    </div>
                );
            }
        },
        {
            key: 'actions',
            label: 'Ações',
            className: 'font-semibold text-gray-700 w-[10%] py-3',
            render: (audience) => (
                <span className="text-gray-600 whitespace-nowrap">
                    <PopConfirm
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
            )
        },
    ];

    const changeAudienceTimeout = useRef<NodeJS.Timeout | null>(null);
    const handleFilterChange = (key: keyof AudiencesApi.FindAll.Params, value: string | number | null) => {
        if (['dateStart', 'dateEnd'].includes(key)) {
            return;
        }
        setFilters(prev => ({ ...prev, [key]: value }));
        if (changeAudienceTimeout.current) {
            clearTimeout(changeAudienceTimeout.current);
        }
        changeAudienceTimeout.current = setTimeout(() => {
            changeFilter({
                page: 1,
                limit: audienceParams.limit,
                cnj: filters.cnj,
                approvedStatus: filters.approvedStatus,
                dateStart: audienceParams.dateStart,
                dateEnd: audienceParams.dateEnd,
                [key]: value
            });
        }, 500);
    }

    const clearFilters = () => {
        setFilters({
            cnj: "",
            approvedStatus: null,
        });
        setDate(undefined);
        changeFilter({
            page: 1,
            limit: audienceParams.limit,
            cnj: undefined,
            approvedStatus: null,
        });
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleExport = async () => {
        let initialDate = undefined;
        let finalDate = undefined;
        const d = date as DateRange;
        if (d && d.from && d.to) {
            initialDate = dayjs(d.from).format("YYYY-MM-DD");
            finalDate = dayjs(d.to).format("YYYY-MM-DD");
        }
        try {
            await AudiencesApi.exportToXLSX({
                ...filters,
                dateStart: initialDate,
                dateEnd: finalDate,
            });
            toast.success('Arquivo exportado com sucesso!');
        } catch {
            toast.error('Erro ao exportar arquivo');
        }
    };

    useEffect(() => {
        if (date && date.from && date.to) {
            changeFilter({
                dateStart: date.from?.toISOString() || undefined,
                dateEnd: date.to?.toISOString() || undefined,
            });
        } else {
            changeFilter({
                dateStart: undefined,
                dateEnd: undefined,
            });
        }
    }, [date]);

    return (
        <div className={cn("bg-white border rounded-lg shadow-sm overflow-hidden", className)}>
            <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-800">Audiências</h2>
                        {selectedAudiences.size > 0 && (
                            <>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {selectedAudiences.size} selecionada{selectedAudiences.size > 1 ? 's' : ''}
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedAudiences(new Map())}
                                    className="h-6 px-2 text-xs"
                                >
                                    Limpar seleção
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs" loading={isPerformingAction}>
                                            Ações
                                            <ChevronDown className="ml-1 h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem
                                            onClick={() => handleBulk(true)}
                                            className="text-green-600 focus:text-green-600"
                                        >
                                            <ThumbsUp className="mr-2 h-4 w-4" />
                                            Aprovar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleBulk(false)}
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            <ThumbsDown className="mr-2 h-4 w-4" />
                                            Reprovar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>
                    <TableButtons
                        onRefresh={onRefresh}
                        onExport={handleExport}
                        toggleFilters={toggleFilters}
                        totalFilters={Object.entries(filters || {}).filter(([key, value]) => !!value && key !== "initialDate").length}
                    />
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <label htmlFor="processNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Nº Processo
                            </label>
                            <Input
                                id="processNumber"
                                value={filters?.cnj || ""}
                                onChange={(e) => handleFilterChange('cnj', e.target.value)}
                                placeholder="Filtrar por nº processo"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="approvalStatus" className="block text-sm font-medium text-gray-700 mb-1">
                                Status de Aprovação
                            </label>
                            <select
                                id="approvalStatus"
                                value={filters?.approvedStatus || ""}
                                onChange={(e) => handleFilterChange('approvedStatus', e.target.value ? Number(e.target.value) : null)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="">Todos</option>
                                <option value="1">Aprovadas</option>
                                <option value="2">Reprovadas</option>
                                <option value="3">Pendentes</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Período da Audiência</label>
                            <DatePickerWithRange
                                date={date}
                                onChange={(newDate) => {
                                    const d = newDate as DateRange;
                                    setDate(newDate as DateRange);
                                }}
                            />
                        </div>
                        <div className="col-span-full">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                className="flex items-center gap-1"
                            >
                                <X className="h-4 w-4" />
                                Limpar Filtros
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 border-b">
                            {columns.map((column) => (
                                <TableHead key={column.key} className={column.className}>
                                    {column.key === 'select' ? (
                                        <input
                                            type="checkbox"
                                            checked={isAllCurrentPageSelected}
                                            ref={(input) => {
                                                if (input) input.indeterminate = isSomeSelected && !isAllCurrentPageSelected;
                                            }}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                        />
                                    ) : (
                                        column.label
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {getAudiencesQuery.isFetching ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                                    <div className="flex justify-center items-center">
                                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                                        Carregando audiências...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : getAudiencesQuery.data?.audiences.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <Search className="h-8 w-8 mb-2 text-gray-400" />
                                        <p>Nenhuma audiência encontrada</p>
                                        {Object.values(filters || {}).some(v => v !== "" && v !== null) && (
                                            <Button
                                                variant="link"
                                                onClick={clearFilters}
                                                className="mt-2 text-primary-blue"
                                            >
                                                Limpar filtros
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            getAudiencesQuery.data?.audiences.map((audience, index) => (
                                <TableRow
                                    key={audience.id}
                                    className={cn(
                                        "hover:bg-gray-50 transition-colors",
                                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                    )}
                                >
                                    {columns.map((column) => (
                                        <TableCell key={`${audience.id}-${column.key}`} className="py-3">
                                            {column.render(audience)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                total={getAudiencesQuery.data?.total || 0}
                pagination={{
                    page: audienceParams.page || 1,
                    limit: audienceParams.limit || 10
                }}
                setPagination={({ page, limit }) => {
                    changeFilter({
                        page,
                        limit
                    });
                }}
            />
            <ModalViewText
                isOpen={!!selectedText}
                onClose={() => setSelectedText("")}
                text={selectedText}
            />
        </div>
    );
}
