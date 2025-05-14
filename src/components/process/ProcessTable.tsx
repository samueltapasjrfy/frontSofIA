"use client";

import { useState, ReactNode, useRef } from "react";
import { AsyncPaginate } from 'react-select-async-paginate';
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
  RefreshCcw,
  Info,
  Trash2,
  MonitorOff,
  Monitor,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { toast } from "sonner";
import { Pagination } from "../pagination";
import { ProcessApi } from "@/api/processApi";
import { useProcesses } from "@/hooks/useProcess";
import { PROCESS_STATUS, processStatusColors } from "@/constants/process";
import PopConfirm from "../ui/popconfirm";
import { ProcessInfoModal } from "./processInfoModal";
import { SelectInfinityScroll } from "../selectInfinityScroll";
import { BatchApi } from "@/api/batchApi";
import { BATCH_TYPES } from "@/constants/batch";
import { TableButtons } from "../tableButtons";

interface ProcessTableProps {
  onRefresh: () => Promise<void>;
  className?: string;
}

// Interface para definir a estrutura de cada coluna
interface Column {
  key: string;
  label: string;
  className?: string;
  render: (process: ProcessApi.FindAll.Process) => ReactNode;
}

export function ProcessTable({
  onRefresh,
  className,
}: ProcessTableProps) {
  const [filters, setFilters] = useState<ProcessApi.FindAll.Params['filter']>({});
  const [showFilters, setShowFilters] = useState(false);
  const { getProcessesQuery, changeProcessFilter, processParams, setMonitoring, deleteProcess } = useProcesses();
  const [processInfoSelected, setProcessInfoSelected] = useState<ProcessApi.FindAll.Process | null>(null);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<{ label: string, value: string } | null>(null);

  const getProcessStatusColor = (status: number) => {
    return processStatusColors[status] || processStatusColors.default;
  };

  // Definição das colunas da tabela
  const columns: Column[] = [
    {
      key: 'cnj',
      label: 'Nº Processo',
      className: 'font-semibold text-gray-700 py-3 w-[60%]',
      render: (process) => (
        <span className="font-medium text-gray-700" style={{ wordBreak: 'break-all' }}>
          {process.cnj}
        </span>
      )
    },
    {
      key: 'instance',
      label: 'Instância',
      className: 'font-semibold text-gray-700 w-[10%] py-3',
      render: (process) => (
        <span className="text-gray-600">
          {process.instance}
        </span>
      )
    },
    {
      key: 'monitoring',
      label: 'Monitoramento',
      className: 'font-semibold text-gray-700 w-[10%] py-3',
      render: (process) => (
        <Badge className={cn(process.monitoring ? "bg-green-500" : "bg-yellow-500", "font-medium")}>
          {process.monitoring ? "Ativo" : "Inativo"}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      className: 'font-semibold text-gray-700 text-center w-[10%] py-3',
      render: (process) => {
        if (!process.status) return "-";

        return (
          <div className="flex items-center justify-center">

            <Badge className={cn(getProcessStatusColor(process.status.id), "font-medium")}>
              {process.status.value || "-"}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Data Inserção',
      className: 'font-semibold text-gray-700 w-[10%] py-3',
      render: (process) => (
        <span className="text-gray-600 whitespace-nowrap">
          {dayjs(process.createdAt || null).format("DD/MM/YYYY HH:mm")}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'font-semibold text-gray-700 w-[5%] py-3',
      render: (process) => (
        <span className="text-gray-600 whitespace-nowrap">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-blue hover:text-primary-blue hover:bg-primary-blue/10"
            title="Informações"
            disabled={process.status.id !== PROCESS_STATUS.COMPLETED}
            onClick={() => setProcessInfoSelected(process)}
          >
            <Info className="h-4 w-4" />
          </Button>
          {process.monitoring ? (
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
          ) : (
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
          )
          }
          <PopConfirm
            title="Descartar"
            description="Tem certeza que deseja descartar este processo?"
            onConfirm={async () => {
              await deleteProcess(process.id);
              toast.success("Processo descartado com sucesso!");
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Descartar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </PopConfirm>
        </span>
      )
    },
  ];

  const renderBatch = (batch: BatchApi.Batch) => {
    return <span className="text-gray-600 whitespace-nowrap">
      <div className="flex items-center text-gray-500 text-sm">
        <Clock className="h-3 w-3 mr-2" />
        {dayjs(batch.createdAt).format("DD/MM/YYYY HH:mm")}
      </div>
      <div className="flex items-center gap-3">
        {`${batch.total} ${+batch.total === 1 ? "processo" : "processos"}`}
        <Badge className={cn(getProcessStatusColor(batch.status.id), "font-medium text-xs")}>
          {batch.status.value}
        </Badge>
      </div>
    </span>
  }

  const changeProcessTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleFilterChange = (key: keyof ProcessApi.FindAll.Params['filter'], value: string | number | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (changeProcessTimeout.current) {
      clearTimeout(changeProcessTimeout.current);
    }
    changeProcessTimeout.current = setTimeout(() => {
      changeProcessFilter({
        page: 1,
        limit: processParams.limit,
        filter: {
          ...filters,
          [key]: value
        }
      });
    }, 500);
  }

  const clearFilters = () => {
    setFilters({
      cnj: "",
      status: undefined,
      monitoring: undefined,
    });
    setSelectedBatch(null);
    changeProcessFilter({
      page: 1,
      limit: processParams.limit,
      filter: {}
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleExport = async () => {
    try {
      await ProcessApi.exportToXLSX();
      toast.success('Arquivo exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar arquivo');
    }
  };

  return (
    <div className={cn("bg-white border rounded-lg shadow-sm overflow-hidden", className)}>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Processos</h2>
          <TableButtons
            onRefresh={onRefresh}
            onExport={handleExport}
            toggleFilters={toggleFilters}
            totalFilters={Object.values(filters || {}).filter(v => !!v).length}
          />
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
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
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={filters?.status}
                onChange={(e) => {
                  handleFilterChange(
                    "status" as never,
                    e.target.value
                  );
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Todos</option>
                <optgroup label="Status de Processamento">
                  <option value={PROCESS_STATUS.PENDING}>Pendente</option>
                  <option value={PROCESS_STATUS.PROCESSING}>Em Processamento</option>
                  <option value={PROCESS_STATUS.COMPLETED}>Concluído</option>
                  <option value={PROCESS_STATUS.ERROR}>Erro</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label htmlFor="monitoring" className="block text-sm font-medium text-gray-700 mb-1">
                Monitorando
              </label>
              <select
                id="monitoring"
                value={filters?.monitoring === undefined ? '' : filters?.monitoring as unknown as string}
                onChange={(e) => {
                  handleFilterChange(
                    "monitoring" as never,
                    e.target.value
                  );
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value={''}>Todos</option>
                <optgroup label="Status de Processamento">
                  <option value={'true'}>Sim</option>
                  <option value={'false'}>Não</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-1">
                Solicitação
              </label>
              <SelectInfinityScroll
                instanceId="batch"
                placeholder="Selecione uma solicitação"
                isSearchable={false}
                loadOptions={async ({ additional }) => {
                  try {
                    const page = (additional || {}).page || 1;
                    setIsLoadingBatches(true);
                    const batches = await BatchApi.findAll({
                      page,
                      limit: 10,
                      type: BATCH_TYPES.PROCESSES
                    });
                    const hasMore = batches.batches.length === 10;
                    setIsLoadingBatches(false);
                    return Promise.resolve({
                      options: batches.batches.map((batch) => ({
                        label: renderBatch(batch),
                        value: batch.id
                      })),
                      hasMore: hasMore,
                      additional: {
                        page: page + 1,
                        hasMore: hasMore
                      }
                    });
                  } catch (error) {
                    console.error(error);
                    return {
                      options: [],
                      hasMore: false
                    };
                  }
                }}
                onChange={(value) => {
                  if (value) {
                    handleFilterChange("batch" as never, (value || {}).value);
                    setSelectedBatch(value);
                    return
                  }
                  handleFilterChange("batch" as never, null);
                  setSelectedBatch(null);
                }}
                value={selectedBatch ? [{
                  label: selectedBatch.label,
                  value: selectedBatch.value
                }] : []}
                isLoading={isLoadingBatches}
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
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {getProcessesQuery.isFetching ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  <div className="flex justify-center items-center">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    Carregando protocolos...
                  </div>
                </TableCell>
              </TableRow>
            ) : getProcessesQuery.data?.processes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <Search className="h-8 w-8 mb-2 text-gray-400" />
                    <p>Nenhum protocolo encontrado</p>
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
              getProcessesQuery.data?.processes.map((process, index) => (
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
        total={getProcessesQuery.data?.total || 0}
        pagination={{
          page: processParams.page || 1,
          limit: processParams.limit || 10
        }}
        setPagination={({ page, limit }) => {
          changeProcessFilter({
            page,
            limit
          });
        }}
      />
      <ProcessInfoModal
        isOpen={!!processInfoSelected}
        onClose={() => setProcessInfoSelected(null)}
        processInfoSelected={processInfoSelected}
      />
    </div>
  );
} 