"use client";

import { useState, useMemo, ReactNode } from "react";
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
  Trash2,
  RefreshCw,
  ChevronRight,
  Search,
  Filter,
  X,
  RefreshCcw,
  ThumbsUp,
  ThumbsDown,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicationsApi } from "@/api/publicationsApi";
import { CLASSIFICATION_STATUS, classificationStatusColors, PUBLICATION_CASE_TYPE, PUBLICATION_STATUS, publicationStatusColors } from "@/constants/publications";
import dayjs from "dayjs";
import PopConfirm from "../ui/popconfirm";
import { toast } from "sonner";
import { ReclassifyPublicationModal } from "./ReclassifyPublicationModal";
import { useClassifications } from "@/hooks/useClassifications";
import { usePublications } from "@/hooks/usePublications";
import ModalViewText from "../modalViewText";
import { Pagination } from "../pagination";

interface PublicationsTableProps {
  onConfirm: (publication: PublicationsApi.FindAll.Publication) => void;
  onDiscard: (id: string) => void;
  onRefresh: () => void;
  className?: string;
}

type FilterStatus = { type: 'classification' | 'processing'; value: string } | "";

// Interface para definir a estrutura de cada coluna
interface Column {
  key: string;
  label: string;
  className?: string;
  render: (publication: PublicationsApi.FindAll.Publication) => ReactNode;
}

export function PublicationsTable({
  onConfirm,
  onDiscard,
  onRefresh,
  className,
}: PublicationsTableProps) {
  const [filters, setFilters] = useState<{
    processNumber: string;
    text: string;
    type: string;
    status: FilterStatus;
    confidence: number | null;
  }>({
    processNumber: "",
    text: "",
    type: "",
    status: "",
    confidence: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isReclassifyModalOpen, setIsReclassifyModalOpen] = useState(false);
  const [selectedPublicationId, setSelectedPublicationId] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const { getPublicationsQuery, changeFilter: changeFilterPublications, publicationParams } = usePublications();
  const { getClassificationsQuery, changeFilter: changeFilterClassifications } = useClassifications(PUBLICATION_CASE_TYPE.CIVIL);
  const { getClassificationsQuery: allClassifications } = useClassifications();

  const getStatusColor = (status: number) => {
    return publicationStatusColors[status] || publicationStatusColors.default;
  };

  // Função para truncar texto e adicionar "ver mais"
  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text || text.length <= maxLength) return text || "";
    return (
      <div className="flex items-center gap-2">
        <span className="line-clamp-2">{text.substring(0, maxLength)}...</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-blue font-medium hover:bg-blue-50 p-1 h-auto"
          onClick={() => {
            setSelectedText(text);
            setIsTextModalOpen(true);
          }}
        >
          <span className="sr-only">Ver mais</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const getClassificationStatusColor = (status: number) => {
    return classificationStatusColors[status] || classificationStatusColors.default;
  };

  const handleReclassifyClick = (publication: PublicationsApi.FindAll.Publication) => {
    setSelectedPublicationId(publication.id);
    changeFilterClassifications({
      idCaseType: publication.caseType?.id,
    });
    setIsReclassifyModalOpen(true);
  };

  const btnDisabled = (publication: PublicationsApi.FindAll.Publication) => {
    return [PUBLICATION_STATUS.PROCESSING].includes(publication.status.id) || publication.classifications?.[0]?.status.id !== CLASSIFICATION_STATUS.PENDING;
  }

  // Definição das colunas da tabela
  const columns: Column[] = [
    {
      key: 'litigationNumber',
      label: 'Nº Processo',
      className: 'font-semibold text-gray-700 py-3 w-[200px]',
      render: (publication) => (
        <span className="font-medium text-gray-700" style={{ wordBreak: 'break-all' }}>
          {publication.litigationNumber}
        </span>
      )
    },
    {
      key: 'text',
      label: 'Texto',
      className: 'font-semibold text-gray-700 py-3 w-[100px]',
      render: (publication) => (
        <span className="text-gray-600">
          {truncateText(publication.text || "", 50)}
        </span>
      )
    },
    {
      key: 'caseType',
      label: 'Modalidade',
      className: 'font-semibold text-gray-700 w-[100px] py-3',
      render: (publication) => (
        <span className="text-gray-600">
          {publication.caseType?.value || "-"}
        </span>
      )
    },
    {
      key: 'classificationType',
      label: 'Tipo Publicação',
      className: 'font-semibold text-gray-700 w-[100px] py-3',
      render: (publication) => (
        <span className="text-gray-600">
          {publication.classifications?.[0]?.classification || "-"}
        </span>
      )
    },
    {
      key: 'confidence',
      label: 'Confiança',
      className: 'font-semibold text-gray-700 text-center w-[100px] py-3',
      render: (publication) => {
        if (publication.classifications?.[0]?.confidence === null) return "-";

        const confidence = publication.classifications?.[0]?.confidence || 0;
        const confidencePercentage = confidence * 100;

        return (
          <span className={cn(
            "font-medium px-2 py-1 rounded-full text-xs inline-block min-w-[50px]",
            confidence >= 0.9 ? "bg-green-100 text-green-800" :
              confidence >= 0.8 ? "bg-blue-100 text-blue-800" :
                "bg-yellow-100 text-yellow-800"
          )}>
            {`${confidencePercentage.toFixed(0)}%`}
          </span>
        );
      }
    },
    {
      key: 'processingStatus',
      label: 'Status Processamento',
      className: 'font-semibold text-gray-700 text-center w-[140px] py-3',
      render: (publication) => (
        <Badge className={cn(getStatusColor(publication.status.id), "font-medium")}>
          {publication.status.value}
        </Badge>
      )
    },
    {
      key: 'classificationStatus',
      label: 'Validação',
      className: 'font-semibold text-gray-700 text-center w-[140px] py-3',
      render: (publication) => {
        if (!publication.classifications?.[0]) return "-";

        return (
          <Badge className={cn(getClassificationStatusColor(publication.classifications[0].status.id), "font-medium")}>
            {publication.classifications[0].status.value || "-"}
          </Badge>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Data Inserção',
      className: 'font-semibold text-gray-700 w-[150px] py-3',
      render: (publication) => (
        <span className="text-gray-600 whitespace-nowrap">
          {dayjs(publication.createdAt || null).format("DD/MM/YYYY HH:mm")}
        </span>
      )
    },
    {
      key: 'processedAt',
      label: 'Data Processamento',
      className: 'font-semibold text-gray-700 w-[150px] py-3',
      render: (publication) => (
        <span className="text-gray-600 whitespace-nowrap">
          {publication.status.id === PUBLICATION_STATUS.COMPLETED
            ? dayjs(publication.updatedAt || null).format("DD/MM/YYYY HH:mm")
            : "-"}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'font-semibold text-gray-700 text-center w-[120px] py-3',
      render: (publication) => (
        <div className="flex justify-center gap-1">
          <PopConfirm
            title="Confirmar"
            description="Tem certeza que deseja confirmar esta publicação?"
            onConfirm={async () => onConfirm(publication)}
            disabled={btnDisabled(publication)}
          >
            <Button
              variant="ghost"
              size="icon"
              disabled={btnDisabled(publication)}
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Confirmar"
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
          </PopConfirm>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleReclassifyClick(publication)}
            disabled={btnDisabled(publication)}
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Reclassificar"
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
          <PopConfirm
            title="Descartar"
            description="Tem certeza que deseja descartar esta publicação?"
            onConfirm={async () => onDiscard(publication.id)}
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
        </div>
      )
    }
  ];

  // Aplicar filtros
  const filteredPublications = useMemo(() => {
    return (getPublicationsQuery.data?.publications || []).filter(pub => {
      const matchesProcessNumber = String(pub.litigationNumber || "").toLowerCase().includes(filters.processNumber.toLowerCase());
      const matchesText = String(pub.text || "").toLowerCase().includes(filters.text.toLowerCase());
      const matchesType = !filters.type || pub.classifications?.[0]?.classification === filters.type;

      const matchesStatus = !filters.status || (
        filters.status.type === 'classification'
          ? pub.classifications?.[0]?.status.value === filters.status.value
          : pub.status.value === filters.status.value
      );

      const matchesConfidence = !filters.confidence ||
        (pub.classifications?.[0]?.confidence && (
          filters.confidence === 69
            ? pub.classifications[0].confidence < 0.7
            : pub.classifications[0].confidence >= (filters.confidence / 100)
        ));

      return matchesProcessNumber && matchesText && matchesType && matchesStatus && matchesConfidence;
    });
  }, [getPublicationsQuery.data?.publications, filters]);

  const handlePageChange = (page: number) => {
    changeFilterPublications({
      page: page,
      limit: publicationParams.limit
    });
  };

  const handleFilterChange = (key: keyof typeof filters, value: string | number | null | FilterStatus) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    changeFilterPublications({
      page: 1,
      limit: publicationParams.limit
    });
  };

  const clearFilters = () => {
    setFilters({
      processNumber: "",
      text: "",
      type: "",
      status: "",
      confidence: null,
    });
    changeFilterPublications({
      page: 1,
      limit: publicationParams.limit
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleReclassifyConfirm = async (selectedOption: string) => {
    if (!selectedPublicationId) return;

    setIsReclassifyModalOpen(false);
    setSelectedPublicationId("");

    await PublicationsApi.reclassify({
      idPublication: selectedPublicationId,
      idClassification: parseInt(selectedOption)
    });

    toast.success("Publicação reclassificada com sucesso");
    onRefresh();
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await PublicationsApi.exportToXLSX();
      toast.success('Arquivo exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar arquivo');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={cn("bg-white border rounded-lg shadow-sm overflow-hidden", className)}>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Publicações</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFilters}
              className={cn(
                "flex items-center gap-1",
                showFilters && "bg-blue-50 border-primary-blue text-primary-blue"
              )}
            >
              <Filter className="h-4 w-4" />
              Filtros
              {Object.values(filters).some(v => v !== "" && v !== null) && (
                <Badge className="ml-1 bg-primary-blue text-white">
                  {Object.values(filters).filter(v => v !== "" && v !== null).length}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              loading={isExporting}
              onClick={handleExport}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className={cn(
                "flex items-center gap-1",
                showFilters && "bg-blue-50 border-primary-blue text-primary-blue"
              )}
            >
              <RefreshCcw className={`h-4 w-4 ${getPublicationsQuery.isFetching ? "animate-spin" : ""}`} />
              Recarregar
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label htmlFor="processNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Nº Processo
              </label>
              <Input
                id="processNumber"
                value={filters.processNumber}
                onChange={(e) => handleFilterChange("processNumber", e.target.value)}
                placeholder="Filtrar por nº processo"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                Texto
              </label>
              <Input
                id="text"
                value={filters.text}
                onChange={(e) => handleFilterChange("text", e.target.value)}
                placeholder="Filtrar por texto"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Publicação
              </label>
              <select
                id="type"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Todos</option>
                {(allClassifications.data?.classifications || []).map((type) => (
                  <option key={type.id} value={type.classification}>
                    {type.classification}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={filters.status ? `${filters.status.type}:${filters.status.value}` : ""}
                onChange={(e) => {
                  const [type, value] = e.target.value.split(':');
                  handleFilterChange(
                    "status",
                    e.target.value ? { type: type as 'classification' | 'processing', value } : ""
                  );
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Todos</option>
                <optgroup label="Status de Classificação">
                  <option value="classification:Pendente">Pendente</option>
                  <option value="classification:Confirmado">Confirmado</option>
                  <option value="classification:Reclassificado">Reclassificado</option>
                </optgroup>
                <optgroup label="Status de Processamento">
                  <option value="processing:Pendente">Pendente</option>
                  <option value="processing:Concluído">Concluído</option>
                  <option value="processing:Erro">Erro</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label htmlFor="confidence" className="block text-sm font-medium text-gray-700 mb-1">
                Confiança Mínima
              </label>
              <select
                id="confidence"
                value={filters.confidence === null ? "" : filters.confidence.toString()}
                onChange={(e) => handleFilterChange("confidence", e.target.value ? parseInt(e.target.value) : null)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Qualquer</option>
                <option value="90">90% ou mais</option>
                <option value="80">80% ou mais</option>
                <option value="70">70% ou mais</option>
                <option value="69">menos que 70%</option>
              </select>
            </div>
            <div className="col-span-full flex justify-end">
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
            {getPublicationsQuery.isFetching ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  <div className="flex justify-center items-center">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    Carregando publicações...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPublications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <Search className="h-8 w-8 mb-2 text-gray-400" />
                    <p>Nenhuma publicação encontrada</p>
                    {Object.values(filters).some(v => v !== "" && v !== null) && (
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
              filteredPublications.map((publication, index) => (
                <TableRow
                  key={publication.id}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  )}
                >
                  {columns.map((column) => (
                    <TableCell key={`${publication.id}-${column.key}`} className="py-3">
                      {column.render(publication)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        total={getPublicationsQuery.data?.total || 0}
        pagination={{
          page: publicationParams.page,
          limit: publicationParams.limit
        }}
        setPagination={({ page, limit }) => {
          changeFilterPublications({
            page,
            limit
          });
        }}
      />
      <ReclassifyPublicationModal
        isOpen={isReclassifyModalOpen}
        onClose={() => setIsReclassifyModalOpen(false)}
        onConfirm={handleReclassifyConfirm}
        options={getClassificationsQuery.data?.classifications.map(c => ({
          value: c.id.toString(),
          label: c.classification
        })) || []}
      />
      <ModalViewText
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        text={selectedText}
      />
    </div>
  );
} 