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
import {
  RefreshCw,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";
import { DocumentApi } from "@/api/documentApi";
import { DOCUMENT_CLASSIFICATION, DOCUMENT_STATUS, documentClassificationColors, documentStatusColors } from "@/constants/documents";
import { TableButtons } from "@/components/tableButtons";
import { useDocuments } from "@/hooks/useDocuments";
import { TruncateText } from "@/components/truncateText";
import ModalViewText from "@/components/modalViewText";
import { Input } from "@/components/ui/input";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";

interface ProcessTableProps {
  onRefresh: () => Promise<void>;
  className?: string;
}

// Interface para definir a estrutura de cada coluna
interface Column {
  key: string;
  label: string;
  className?: string;
  render: (process: DocumentApi.FindDocuments.Document) => ReactNode;
}

export function DocumentTable({
  onRefresh,
  className,
}: ProcessTableProps) {
  const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)
  const [showFilters, setShowFilters] = useState(false);
  const { getDocumentsQuery, changeDocumentFilter, documentParams } = useDocuments();
  const [text, setText] = useState("");
  const [isViewTextModalOpen, setIsViewTextModalOpen] = useState(false);
  const [filters, setFilters] = useState<DocumentApi.FindDocuments.Params>({
    idCompany: user?.companies?.[0]?.id || ''
  });
  const getDocumentStatusColor = (status: number) => {
    return documentStatusColors[status] || documentStatusColors.default;
  };

  const getDocumentClassificationColor = (classification: number) => {
    return documentClassificationColors[classification] || documentClassificationColors.default;
  };

  // Definição das colunas da tabela
  const columns: Column[] = [
    {
      key: 'id',
      label: 'ID',
      className: 'font-semibold text-gray-700 py-3 w-[15%]',
      render: (document) => (
        <span className="font-medium text-gray-700" style={{ wordBreak: 'break-all' }}>
          {document.id}
        </span>
      )
    },
    {
      key: 'text',
      label: 'Texto',
      className: 'font-semibold text-gray-700 py-3 w-[15%]',
      render: (document) => (
        <span className="font-medium text-gray-700" style={{ wordBreak: 'break-all' }}>
          <TruncateText text={document.text} maxLength={30} onClick={() => {
            setText(document.text)
            setIsViewTextModalOpen(true)
          }} />
        </span>
      )
    },
    {
      key: 'classification',
      label: 'Classificação',
      className: 'font-semibold text-gray-700 text-center w-[10%] py-3',
      render: (document) => (
        <div className="flex items-center justify-center">
          <Badge className={cn(getDocumentClassificationColor(document.documentClassifications?.classification?.id || 0))}>{document.documentClassifications?.classification?.name || "-"}</Badge>
        </div>
      )
    },
    {
      key: 'mandatoryResources',
      label: 'Recurso',
      className: 'font-semibold text-gray-700 text-center w-[10%] py-3',
      render: (document) => {
        const resource = (Array.isArray(document.mandatoryResources) && document.mandatoryResources.length > 0) ? "Sim" : "Não";
        return (
          <div className="flex items-center justify-center">
            <Badge className={"bg-black text-white"}>{resource}</Badge>
          </div>
        )
      }
    },
    {
      key: 'mandatoryResources',
      label: 'Regra',
      className: 'font-semibold text-gray-700 text-center w-[20%] py-3',
      render: (document) => {
        const resource = (Array.isArray(document.mandatoryResources) && document.mandatoryResources.length > 0) ? document.mandatoryResources[0].name : "-";
        return resource
      }
    },
    {
      key: 'status',
      label: 'Status',
      className: 'font-semibold text-gray-700 text-center w-[10%] py-3',
      render: (process) => {
        if (!process.status) return "-";

        return (
          <div className="flex items-center justify-center">

            <Badge className={cn(getDocumentStatusColor(process.status.id), "font-medium")}>
              {process.status.name || "-"}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'metadata',
      label: 'Arquivo',
      className: 'font-semibold text-gray-700 text-center w-[10%] py-3',
      render: (document) => {
        return <span className="text-gray-600">{document.metadata?.file?.filename || "-"}</span>
      }
    },
    {
      key: 'createdAt',
      label: 'Data de criação',
      className: 'font-semibold text-gray-700 text-center w-[10%] py-3',
      render: (document) => (
        <span className="text-gray-600">{dayjs(document.createdAt).format("DD/MM/YYYY HH:mm")}</span>
      )
    },
  ];

  const changeProcessTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleFilterChange = (key: keyof DocumentApi.FindDocuments.Params, value: string | number | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (changeProcessTimeout.current) {
      clearTimeout(changeProcessTimeout.current);
    }
    changeProcessTimeout.current = setTimeout(() => {
      changeDocumentFilter({
        page: 1,
        limit: documentParams.limit,
        [key]: value
      });
    }, 500);
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleExport = async () => {
    try {
      await DocumentApi.exportToXLSX(filters);
      toast.success('Arquivo exportado com sucesso! Limite máximo de 100 sentenças.');
    } catch {
      toast.error('Erro ao exportar arquivo');
    }
  };

  return (
    <div className={cn("bg-white border rounded-lg shadow-sm overflow-hidden", className)}>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Documentos</h2>
          <TableButtons
            onRefresh={onRefresh}
            onExport={handleExport}
            toggleFilters={toggleFilters}
          />
        </div>
      </div>
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
              ID
            </label>
            <Input
              id="id"
              value={filters?.id}
              onChange={(e) => handleFilterChange('id' as never, e.target.value)}
              placeholder="01JZTJ2JXSGVQP1ZMH5XEEZYQK"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
              Texto
            </label>
            <Input
              id="text"
              value={filters?.text}
              onChange={(e) => handleFilterChange('text' as never, e.target.value)}
              placeholder="Contestando, a Ré eriçou a preliminar"
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
                <option value={DOCUMENT_STATUS.PENDING}>Pendente</option>
                <option value={DOCUMENT_STATUS.PROCESSING}>Em Processamento</option>
                <option value={DOCUMENT_STATUS.COMPLETED}>Concluído</option>
                <option value={DOCUMENT_STATUS.FAILED}>Erro</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label htmlFor="classification" className="block text-sm font-medium text-gray-700 mb-1">
              Classificação
            </label>
            <select
              id="classification"
              value={filters?.classification}
              onChange={(e) => {
                handleFilterChange(
                  "classification" as never,
                  e.target.value
                );
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Todos</option>
              <optgroup label="Classificação">
                <option value={DOCUMENT_CLASSIFICATION.PROCEDENTE}>Procedente</option>
                <option value={DOCUMENT_CLASSIFICATION.PARCIALMENTE_PROCEDENTE}>Parcialmente Procedente</option>
                <option value={DOCUMENT_CLASSIFICATION.IMPROCEDENTE}>Improcedente</option>
                <option value={DOCUMENT_CLASSIFICATION.IMPOSSÍVEL_DETERMINAR}>Impossível Determinar</option>
                <option value={DOCUMENT_CLASSIFICATION.HOMOLOGATÓRIA_DE_ACORDO}>Homologatória de Acordo</option>
                <option value={DOCUMENT_CLASSIFICATION.EXTINÇÃO}>Extinção</option>
              </optgroup>
            </select>
          </div>

        </div>
      )}
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
            {getDocumentsQuery.isFetching ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  <div className="flex justify-center items-center">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    Carregando documentos...
                  </div>
                </TableCell>
              </TableRow>
            ) : getDocumentsQuery.data?.documents?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <Search className="h-8 w-8 mb-2 text-gray-400" />
                    <p>Nenhuma sentença encontrada</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              getDocumentsQuery.data?.documents.map((document, index) => (
                <TableRow
                  key={document.id}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  )}
                >
                  {columns.map((column) => (
                    <TableCell key={`${document.id}-${column.key}`} className="py-3">
                      {column.render(document)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        total={getDocumentsQuery.data?.pagination.total || 0}
        pagination={{
          page: documentParams.page || 1,
          limit: documentParams.limit || 10
        }}
        setPagination={({ page, limit }) => {
          changeDocumentFilter({
            page,
            limit
          });
        }}
      />
      <ModalViewText
        isOpen={isViewTextModalOpen}
        onClose={() => { setIsViewTextModalOpen(false) }}
        text={text}
      />
    </div>
  );
} 