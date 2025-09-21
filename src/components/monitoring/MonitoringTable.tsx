"use client";
import { useState, ReactNode, useRef } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    RefreshCw,
    Search,
    X,
    Info,
    Trash2,
    MonitorOff,
    Monitor,
    ChevronDown,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { toast } from "sonner";
import { Pagination } from "../pagination";
import { ProcessApi } from "@/api/processApi";
import { useProcesses } from "@/hooks/useProcess";
import PopConfirm from "../ui/popconfirm";
import { SelectInfinityScroll } from "../selectInfinityScroll";
import { BatchApi } from "@/api/batchApi";
import { BATCH_TYPES } from "@/constants/batch";
import { TableButtons } from "../tableButtons";
import { CompanyApi } from "@/api/companyApi";
import { DatePickerWithRange } from "../dateRangePicker";
import { DateRange } from "react-day-picker";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MonitoringTableProps {
    onRefresh: () => Promise<void>;
    className?: string;
}

// Interface para definir a estrutura de cada coluna
interface Column {
    key: string;
    label: string;
    className?: string;
    render: (process: ProcessApi.FindMonitoring.Process) => ReactNode;
}

export function MonitoringTable({ onRefresh, className }: MonitoringTableProps) {
    const [filters, setFilters] = useState<ProcessApi.FindMonitoring.Params['filter']>({});
    const [showFilters, setShowFilters] = useState(false);
    const {
        getMonitoringProcessesQuery,
        changeMonitoringFilter,
        monitoringParams,
        setMonitoring,
        deleteProcess
    } = useProcesses();
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [selectedProcesses, setSelectedProcesses] = useState<Map<string, { id: string; cnj: string }>>(new Map());
    const [isPerformingAction, setIsPerformingAction] = useState(false);

    // Funções para gerenciar a seleção de processos
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const currentPageProcesses = getMonitoringProcessesQuery.data?.processes || [];
            setSelectedProcesses(prev => {
                const newMap = new Map(prev);
                currentPageProcesses.forEach(p => {
                    newMap.set(p.id, { id: p.id, cnj: p.cnj });
                });
                return newMap;
            });
        } else {
            const currentPageIds = getMonitoringProcessesQuery.data?.processes.map(p => p.id) || [];
            setSelectedProcesses(prev => {
                const newMap = new Map(prev);
                currentPageIds.forEach(id => newMap.delete(id));
                return newMap;
            });
        }
    };

    const handleSelectProcess = (processId: string, checked: boolean) => {
        const process = getMonitoringProcessesQuery.data?.processes.find(p => p.id === processId);
        if (!process) return;

        setSelectedProcesses(prev => {
            const newMap = new Map(prev);
            if (checked) {
                newMap.set(processId, { id: process.id, cnj: process.cnj });
            } else {
                newMap.delete(processId);
            }
            return newMap;
        });
    };

    // Verificar se todos os itens da página atual estão selecionados
    const currentPageIds = getMonitoringProcessesQuery.data?.processes.map(p => p.id) || [];
    const isAllCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedProcesses.has(id));
    const isSomeSelected = currentPageIds.some(id => selectedProcesses.has(id));

    const handleBulkDeactivateMonitoring = async () => {
        try {
            setIsPerformingAction(true);
            const selectedProcessesArray = Array.from(selectedProcesses.values());
            const cnjs = selectedProcessesArray.map(p => p.cnj);

            await ProcessApi.deactivateMonitoringBulk({ cnjs });

            setTimeout(() => {
                toast.success(`Monitoramento desativado para ${selectedProcessesArray.length} processo(s)!`);
                setSelectedProcesses(new Map());
                onRefresh();
                setIsPerformingAction(false);
            }, 2000);
        } catch (error) {
            console.error('Erro ao desativar monitoramento:', error);
            toast.error('Erro ao desativar monitoramento');
            setIsPerformingAction(false);
        }
    };

    const handleBulkActivateMonitoring = async () => {
        try {
            const selectedProcessesArray = Array.from(selectedProcesses.values());
            const processesData = selectedProcessesArray.map(p => ({ cnj: p.cnj }));
            setIsPerformingAction(true);
            await ProcessApi.save({
                processes: processesData,
                monitoring: true,
                registration: false
            });

            setTimeout(() => {
                toast.success(`Monitoramento ativado para ${selectedProcessesArray.length} processo(s)!`);
                setSelectedProcesses(new Map());

                onRefresh();
                setIsPerformingAction(false);
            }, 2000);
        } catch (error) {
            console.error('Erro ao ativar monitoramento:', error);
            toast.error('Erro ao ativar monitoramento');
            setIsPerformingAction(false);
        }
    };

    const getCitationStatus = (process: ProcessApi.FindMonitoring.Process): { label: string, variant: "success" | "outline" } => {
        const hasCitations = process.citations && process.citations.length > 0;

        return {
            label: hasCitations ? "Sim" : "Não",
            variant: hasCitations ? "success" : "outline",
        }

    };

    const getAudienceStatus = (process: ProcessApi.FindMonitoring.Process): { label: string, variant: "success" | "outline" } => {
        const hasAudiences = process.audiences && process.audiences.length > 0;

        return {
            label: hasAudiences ? "Sim" : "Não",
            variant: hasAudiences ? "success" : "outline",
        }
    };

    // Definição das colunas da tabela
    const columns: Column[] = [
        {
            key: 'select',
            label: '',
            className: 'font-semibold text-gray-700 py-3 w-[5%]',
            render: (process) => (
                <input
                    type="checkbox"
                    checked={selectedProcesses.has(process.id)}
                    onChange={(e) => handleSelectProcess(process.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
            )
        },
        {
            key: 'id',
            label: 'ID',
            className: 'font-semibold text-gray-700 py-3 w-[8%]',
            render: (process) => (
                <span className="font-mono text-sm text-gray-700">
                    {process.id}
                </span>
            )
        },
        {
            key: 'cnj',
            label: 'Processo',
            className: 'font-semibold text-gray-700 py-3 w-[15%]',
            render: (process) => (
                <span className="font-mono text-gray-700" style={{ wordBreak: 'break-all' }}>
                    {process.cnj}
                </span>
            )
        },
        {
            key: 'requester',
            label: 'Solicitante',
            className: 'font-semibold text-gray-700 py-3 w-[15%]',
            render: (process) => (
                <span className="font-medium text-gray-700" style={{ wordBreak: 'break-all' }}>
                    {process.requester || "-"}
                </span>
            )
        },
        {
            key: 'client',
            label: 'Cliente',
            className: 'font-semibold text-gray-700 w-[15%] py-3',
            render: (process) => (
                <span className="font-medium text-gray-700" style={{ wordBreak: 'break-all' }}>
                    {process.client || "-"}
                </span>
            )
        },
        {
            key: 'citationIndicator',
            label: 'Indicativo Citação',
            className: 'font-semibold text-gray-700 py-3 w-[12%]',
            render: (process) => {
                const { label, variant } = getCitationStatus(process);
                return (
                    <Badge variant={variant}>
                        {label}
                    </Badge>
                );
            }
        },
        {
            key: 'audienceIndicator',
            label: 'Indicativo Audiência',
            className: 'font-semibold text-gray-700 py-3 w-[12%]',
            render: (process) => {
                const audienceStatus = getAudienceStatus(process);
                return (
                    <Badge variant={audienceStatus.variant}>
                        {audienceStatus.label}
                    </Badge>
                );
            }
        },
        {
            key: 'citationValidated',
            label: 'Citação Validada',
            className: 'font-semibold text-gray-700 py-3 w-[10%]',
            render: (process) => {
                if (!process.citations || process.citations.length === 0) {
                    return <span className="text-gray-400">-</span>;
                }
                return (
                    <div className="flex items-center space-x-1">
                        {process.citations.some(c => c.approved === true) ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : process.citations.some(c => c.approved === false) ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="text-sm">
                            {process.citations.filter(c => c.approved === true).length}/
                            {process.citations.length}
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'audienceValidated',
            label: 'Audiência Validada',
            className: 'font-semibold text-gray-700 py-3 w-[10%]',
            render: (process) => {
                if (!process.audiences || process.audiences.length === 0) {
                    return <span className="text-gray-400">-</span>;
                }
                return (
                    <div className="flex items-center space-x-1">
                        {process.audiences.some(a => a.approved === true) ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : process.audiences.some(a => a.approved === false) ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="text-sm">
                            {process.audiences.filter(a => a.approved === true).length}/
                            {process.audiences.length}
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'addedAt',
            label: 'Data Ativação',
            className: 'font-semibold text-gray-700 w-[10%] py-3',
            render: (process) => (
                <span className="text-gray-600 whitespace-nowrap">
                    {dayjs(process.addedAt).format("DD/MM/YYYY HH:mm")}
                </span>
            )
        },
        {
            key: 'removedAt',
            label: 'Data Inativação',
            className: 'font-semibold text-gray-700 w-[10%] py-3',
            render: (process) => (
                <span className="text-gray-600 whitespace-nowrap">
                    {process.removedAt ? dayjs(process.removedAt).format("DD/MM/YYYY HH:mm") : "-"}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Ações',
            className: 'font-semibold text-gray-700 w-[5%] py-3',
            render: (process) => process.removedAt ? (
                <span className="text-gray-600 whitespace-nowrap">
                    <PopConfirm
                        title="Ativar monitoramento"
                        description="Tem certeza que deseja ativar o monitoramento deste processo?"
                        onConfirm={async () => {
                            await setMonitoring(process.id, true);
                            toast.success("Ativando monitoramento!");
                        }}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Ativar monitoramento"
                        >
                            <Monitor className="h-4 w-4" />
                        </Button>
                    </PopConfirm>
                </span>
            ) :
                (
                    <span className="text-gray-600 whitespace-nowrap">
                        <PopConfirm
                            title="Desativar monitoramento"
                            description="Tem certeza que deseja desativar o monitoramento deste processo?"
                            onConfirm={async () => {
                                await setMonitoring(process.id, false);
                                toast.success("Desativando monitoramento!");
                            }}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                title="Desativar monitoramento"
                            >
                                <MonitorOff className="h-4 w-4" />
                            </Button>
                        </PopConfirm>
                    </span>
                )
        },
    ];

    const renderBatch = (batch: BatchApi.Batch) => {
        return `${dayjs(batch.createdAt).format("DD/MM/YYYY HH:mm")} - ${batch.total} ${+batch.total === 1 ? "processo" : "processos"} - ${batch.status.value}`;
    }

    const changeProcessTimeout = useRef<NodeJS.Timeout | null>(null);
    const handleFilterChange = (key: keyof ProcessApi.FindMonitoring.Params['filter'], value: string | number | null) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (changeProcessTimeout.current) {
            clearTimeout(changeProcessTimeout.current);
        }
        changeProcessTimeout.current = setTimeout(() => {
            const newFilters = { ...filters };
            changeMonitoringFilter({
                page: 1,
                limit: monitoringParams.limit,
                filter: {
                    ...newFilters,
                    [key]: value
                }
            });
        }, 500);
    }

    const clearFilters = () => {
        setFilters({
            cnj: "",
            client: "",
        });
        setDate(undefined);
        changeMonitoringFilter({
            page: 1,
            limit: monitoringParams.limit,
            filter: {}
        });
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    return (
        <div className={cn("bg-white border rounded-lg shadow-sm overflow-hidden", className)}>
            <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-800">Processos em Monitoramento</h2>
                        {selectedProcesses.size > 0 && (
                            <>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {selectedProcesses.size} selecionado{selectedProcesses.size > 1 ? 's' : ''}
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedProcesses(new Map())}
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
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <Monitor className="mr-2 h-4 w-4" />
                                                Monitoramento
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={handleBulkActivateMonitoring}>
                                                    <Monitor className="mr-2 h-4 w-4 text-green-600" />
                                                    Ativar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={handleBulkDeactivateMonitoring}>
                                                    <MonitorOff className="mr-2 h-4 w-4 text-yellow-600" />
                                                    Desativar
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>
                    <TableButtons
                        onRefresh={onRefresh}
                        onExport={async () => { }}
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
                                value={filters?.cnj}
                                onChange={(e) => handleFilterChange('cnj' as never, e.target.value)}
                                placeholder="Filtrar por nº processo"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
                                Cliente
                            </label>
                            <Input
                                id="client"
                                value={filters?.client}
                                onChange={(e) => handleFilterChange("client" as never, e.target.value)}
                                placeholder="Filtrar por cliente"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1"> Período de Ativação </label>
                            <DatePickerWithRange
                                date={date}
                                onChange={(newDate) => {
                                    const d = newDate as DateRange;
                                    if (d && d.from && d.to) {
                                        const initialDate = dayjs(d.from).format("YYYY-MM-DD");
                                        const finalDate = dayjs(d.to).format("YYYY-MM-DD");
                                        changeMonitoringFilter({
                                            page: 1,
                                            limit: monitoringParams.limit,
                                            filter: {
                                                ...filters,
                                                initialDateAdd: initialDate,
                                                finalDateAdd: finalDate
                                            }
                                        });
                                    } else if (date?.from || date?.to) {
                                        changeMonitoringFilter({
                                            page: 1,
                                            limit: monitoringParams.limit,
                                            filter: {
                                                ...filters,
                                                initialDateAdd: undefined,
                                                finalDateAdd: undefined
                                            }
                                        });
                                    }
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
                        {getMonitoringProcessesQuery.isFetching ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                                    <div className="flex justify-center items-center">
                                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                                        Carregando processos...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : getMonitoringProcessesQuery.data?.processes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <Search className="h-8 w-8 mb-2 text-gray-400" />
                                        <p>Nenhum processo encontrado</p>
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
                            getMonitoringProcessesQuery.data?.processes.map((process, index) => (
                                <TableRow
                                    key={process.id}
                                    className={cn(
                                        "hover:bg-gray-50 transition-colors",
                                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                    )}
                                >
                                    {columns.map((column) => (
                                        <TableCell key={`${process.id}-${column.key}`} className="py-3">
                                            {column.render(process)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                total={getMonitoringProcessesQuery.data?.total || 0}
                pagination={{
                    page: monitoringParams.page || 1,
                    limit: monitoringParams.limit || 10
                }}
                setPagination={({ page, limit }) => {
                    changeMonitoringFilter({
                        page,
                        limit
                    });
                }}
            />
        </div>
    );
}
