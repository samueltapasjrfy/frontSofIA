"use client";

import { useState, ReactNode, useRef } from "react";
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
  Info,
  Trash2,
  MonitorOff,
  Monitor,
  ChevronDown,
  MoreVertical,
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
  const [processInfoSelected, setProcessInfoSelected] = useState<string | null>(null);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<{ label: string, value: string } | null>(null);
  const [isLoadingRequesters, setIsLoadingRequesters] = useState(false);
  const [selectedRequester, setSelectedRequester] = useState<{ label: string, value: string } | null>(null);
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [selectedProcesses, setSelectedProcesses] = useState<Map<string, { id: string; cnj: string }>>(new Map());
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  const getProcessStatusColor = (status: number) => {
    return processStatusColors[status] || processStatusColors.default;
  };

  // Funções para gerenciar a seleção de processos
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageProcesses = getProcessesQuery.data?.processes || [];
      setSelectedProcesses(prev => {
        const newMap = new Map(prev);
        currentPageProcesses.forEach(p => {
          newMap.set(p.id, { id: p.id, cnj: p.cnj });
        });
        return newMap;
      });
    } else {
      const currentPageIds = getProcessesQuery.data?.processes.map(p => p.id) || [];
      setSelectedProcesses(prev => {
        const newMap = new Map(prev);
        currentPageIds.forEach(id => newMap.delete(id));
        return newMap;
      });
    }
  };

  const handleSelectProcess = (processId: string, checked: boolean) => {
    const process = getProcessesQuery.data?.processes.find(p => p.id === processId);
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
  const currentPageIds = getProcessesQuery.data?.processes.map(p => p.id) || [];
  const isAllCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedProcesses.has(id));
  const isSomeSelected = currentPageIds.some(id => selectedProcesses.has(id));

  // Funções para ações em lote
  const handleBulkDelete = async () => {
    try {
      setIsPerformingAction(true);
      const selectedProcessesArray = Array.from(selectedProcesses.values());
      const processesData = selectedProcessesArray.map(p => ({ cnj: p.cnj }));

      await ProcessApi.deleteBulkProcess({ processes: processesData });

      setTimeout(() => {
        toast.success(`${selectedProcessesArray.length} processo(s) removido(s) com sucesso!`);
        setSelectedProcesses(new Map());
        onRefresh();
        setIsPerformingAction(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao remover processos:', error);
      toast.error('Erro ao remover processos');
      setIsPerformingAction(false);
    }
  };

  const handleBulkActivateMonitoring = async () => {
    try {
      setIsPerformingAction(true);
      const selectedProcessesArray = Array.from(selectedProcesses.values());
      const processesData = selectedProcessesArray.map(p => ({ cnj: p.cnj }));

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

  const handleBulkStatusChange = async () => {
    try {
      setIsPerformingAction(true);
      const selectedProcessesArray = Array.from(selectedProcesses.values());
      const ids = selectedProcessesArray.map(p => p.id);

      await ProcessApi.setImported({
        cnjs: [],
        ids
      });

      setTimeout(() => {
        toast.success(`${selectedProcessesArray.length} processo(s) marcado(s) como importado(s)!`);
        setSelectedProcesses(new Map());
        onRefresh();
        setIsPerformingAction(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao marcar como importado:', error);
      toast.error('Erro ao marcar processos como importados');
      setIsPerformingAction(false);
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
      key: 'cnj',
      label: 'Nº Processo',
      className: 'font-semibold text-gray-700 py-3 w-[28%]',
      render: (process) => (
        <span className="font-medium text-gray-700" style={{ wordBreak: 'break-all' }}>
          {process.cnj}
        </span>
      )
    },
    {
      key: 'requester',
      label: 'Solicitante',
      className: 'font-semibold text-gray-700 py-3 w-[20%]',
      render: (process) => (
        <span className="font-medium text-gray-700" style={{ wordBreak: 'break-all' }}>
          {process.requester?.name || "-"}
        </span>
      )
    },
    {
      key: 'idBatch',
      label: 'ID Solicitação',
      className: 'font-semibold text-gray-700 py-3 w-[25%]',
      render: (process) => (
        <span className="font-medium text-gray-700" style={{ wordBreak: 'break-all' }}>
          {process.idBatch || "-"}
        </span>
      )
    },
    {
      key: 'client',
      label: 'Cliente',
      className: 'font-semibold text-gray-700 w-[15%] py-3',
      render: (process) => (
        <span className="font-medium text-gray-700" style={{ wordBreak: 'break-all' }}>
          {process.metadata?.cliente || "-"}
        </span>
      )
    },
    {
      key: 'cited',
      label: 'Citado',
      className: 'font-semibold text-gray-700 py-3 w-[10%]',
      render: (process) => (
        <span className="font-medium text-gray-700">
          {process.cited ? "Sim" : "Não"}
        </span>
      )
    },
    {
      key: 'audience',
      label: 'Audiência Futura',
      className: 'font-semibold text-gray-700 py-3 w-[10%]',
      render: (process) => {
        const audiences = Array.isArray(process.audiences) ? process.audiences.filter(audience => new Date(audience.date) >= new Date()) : [];
        return (
          <span className="font-medium text-gray-700">
            {audiences.length > 0 ? 'Sim' : 'Não'}
          </span>
        )
      }
    },
    {
      key: 'preliminaryInjunction',
      label: 'Liminar',
      className: 'font-semibold text-gray-700 py-3 w-[10%]',
      render: (process) => {
        return (
          <span className="font-medium text-gray-700">
            {process.preliminaryInjunction ? 'Sim' : 'Não'}
          </span>
        )
      }
    },
    {
      key: 'addedToMonitoring',
      label: 'Monitorado',
      className: 'font-semibold text-gray-700 w-[10%] py-3',
      render: (process) => (
        <Badge className={cn(process.addedToMonitoring ? "bg-green-500" : "bg-yellow-500", "font-medium")}>
          {process.addedToMonitoring ? "Sim" : "Não"}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      className: 'font-semibold text-gray-700 text-center w-[10%] py-3',
      render: (process) => {
        // Se o processo tem metadata.imported = true, mostrar "Importado"
        if (process.imported === true) {
          return (
            <div className="flex items-center justify-center">
              <Badge className={cn("bg-blue-500 text-white", "font-medium")}>
                Importado
              </Badge>
            </div>
          );
        }

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
            disabled={![PROCESS_STATUS.COMPLETED, PROCESS_STATUS.UPDATING_INFORMATION].includes(process.status.id)}
            onClick={() => setProcessInfoSelected(process.id)}
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
    return `${dayjs(batch.createdAt).format("DD/MM/YYYY HH:mm")} - ${batch.total} ${+batch.total === 1 ? "processo" : "processos"} - ${batch.status.value}`;
  }

  const changeProcessTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleFilterChange = (key: keyof ProcessApi.FindAll.Params['filter'], value: string | number | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (changeProcessTimeout.current) {
      clearTimeout(changeProcessTimeout.current);
    }
    changeProcessTimeout.current = setTimeout(() => {
      const newFilters = { ...filters };

      if (key === "status" && value === PROCESS_STATUS.IMPORTED.toString()) {
        newFilters.status = undefined;
        key = "imported" as never;
        value = true as never;
      }
      else if (key === "status" && value != PROCESS_STATUS.IMPORTED.toString()) {
        newFilters.imported = undefined;
      }

      changeProcessFilter({
        page: 1,
        limit: processParams.limit,
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
      status: undefined,
      monitoring: undefined,
    });
    setDate(undefined);
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
    let initialDate = undefined;
    let finalDate = undefined;
    const d = date as DateRange;
    if (d && d.from && d.to) {
      initialDate = dayjs(d.from).format("YYYY-MM-DD");
      finalDate = dayjs(d.to).format("YYYY-MM-DD");
    }
    try {
      await ProcessApi.exportToXLSX({
        ...filters,
        initialDate,
        finalDate
      });
      toast.success('Arquivo exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar arquivo');
    }
  };

  return (
    <div className={cn("bg-white border rounded-lg shadow-sm overflow-hidden", className)}>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">Processos</h2>
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
                    <DropdownMenuItem
                      onClick={handleBulkDelete}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

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

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Info className="mr-2 h-4 w-4" />
                        Status
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={handleBulkStatusChange}>
                          <Info className="mr-2 h-4 w-4 text-blue-600" />
                          Importado
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
                value={filters?.imported ? PROCESS_STATUS.IMPORTED : filters?.status}
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
                  <option value={PROCESS_STATUS.NOT_FOUND}>Processo não encontrado</option>
                  <option value={PROCESS_STATUS.IMPORTED}>Importado</option>
                  <option value={PROCESS_STATUS.UPDATING_INFORMATION}>Atualizando informações</option>
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
                placeholder="Selecione"
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
                      hasMore: false,
                      additional: { page: 1, hasMore: false }
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
            <div>
              <label htmlFor="requester" className="block text-sm font-medium text-gray-700 mb-1">
                Solicitante
              </label>
              <SelectInfinityScroll
                instanceId="requester"
                placeholder="Selecione"
                isSearchable={false}
                loadOptions={async ({ additional }) => {
                  try {
                    const page = (additional || {}).page || 1;
                    setIsLoadingRequesters(true);
                    const requesters = await CompanyApi.findUsers({
                      page,
                      limit: 10,
                    });
                    const hasMore = requesters.data.users.length === 10;
                    setIsLoadingRequesters(false);
                    return Promise.resolve({
                      options: requesters.data.users.map((user) => ({
                        label: user.name,
                        value: user.id
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
                      hasMore: false,
                      additional: { page: 1, hasMore: false }
                    };
                  }
                }}
                onChange={(value) => {
                  if (value) {
                    handleFilterChange("requester" as never, (value || {}).value);
                    setSelectedRequester(value);
                    return
                  }
                  handleFilterChange("requester" as never, null);
                  setSelectedRequester(null);
                }}
                value={selectedRequester ? [{
                  label: selectedRequester.label,
                  value: selectedRequester.value
                }] : []}
                isLoading={isLoadingRequesters}
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1"> Período de Cadastro </label>
              <DatePickerWithRange
                date={date}
                onChange={(newDate) => {
                  const d = newDate as DateRange;
                  if (d && d.from && d.to) {
                    const initialDate = dayjs(d.from).format("YYYY-MM-DD");
                    const finalDate = dayjs(d.to).format("YYYY-MM-DD");
                    changeProcessFilter({
                      page: 1,
                      limit: processParams.limit,
                      filter: {
                        ...filters,
                        initialDate,
                        finalDate
                      }
                    });
                  } else if (date?.from || date?.to) {
                    changeProcessFilter({
                      page: 1,
                      limit: processParams.limit,
                      filter: {
                        ...filters,
                        initialDate: undefined,
                        finalDate: undefined
                      }
                    });
                  }
                  setDate(newDate as DateRange);
                }}
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
        processInfoSelected={processInfoSelected ? getProcessesQuery.data?.processes.find(p => p.id === processInfoSelected) || null : null}
      />
    </div>
  );
} 