"use client";

import { useState, useMemo, useEffect } from "react";
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
  CheckCircle, 
  Trash2, 
  RefreshCw, 
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  X
} from "lucide-react";
import { PublicationStatus, PublicationType } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";
import { PublicationsApi } from "@/api/publicationsApi";
import { PUBLICATION_STATUS } from "@/constants/publications";
import dayjs from "dayjs";
interface PublicationsTableProps {
  publications: PublicationsApi.FindAll.Publication[];
  onConfirm: (id: string) => void;
  onDiscard: (id: string) => void;
  onReclassify: (id: string) => void;
  isLoading?: boolean;
  className?: string;
  total: number;
  pagination: { page: number; size: number };
  setPagination: (pagination: { page: number; size: number }) => void;
}

export function PublicationsTable({ 
  publications, 
  onConfirm, 
  onDiscard, 
  onReclassify, 
  isLoading = false,
  className,
  total,
  pagination,
  setPagination
}: PublicationsTableProps) {
  const [filters, setFilters] = useState<{
    processNumber: string;
    text: string;
    type: PublicationType | "";
    status: PublicationStatus | "";
    confidence: number | null;
  }>({
    processNumber: "",
    text: "",
    type: "",
    status: "",
    confidence: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalPages, setTotalPages] = useState(Math.ceil(total / pagination.size));

  // Função para determinar a cor do badge de status
  const getStatusColor = (status: number) => {
    switch (status) {
      case PUBLICATION_STATUS.COMPLETED:
        return "bg-primary-green text-white";
      case PUBLICATION_STATUS.PENDING:
        return "bg-yellow-400 text-black";
      case PUBLICATION_STATUS.PROCESSING:
        return "bg-primary-blue text-white";
      case PUBLICATION_STATUS.ERROR:
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Função para truncar texto e adicionar "ver mais"
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return (
      <div className="flex items-center gap-2">
        <span className="line-clamp-2">{text.substring(0, maxLength)}...</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary-blue font-medium hover:bg-blue-50 p-1 h-auto"
        >
          <span className="sr-only">Ver mais</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Aplicar filtros
  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      const matchesProcessNumber = String(pub.litigationNumber || "").toLowerCase().includes(filters.processNumber.toLowerCase());
      const matchesText = String(pub.text || "").toLowerCase().includes(filters.text.toLowerCase());
      const matchesType = !filters.type || pub.caseType?.value === filters.type;
      const matchesStatus = !filters.status || pub.status.value === filters.status;
      const matchesConfidence = !filters.confidence || 
        (pub.classifications?.[0]?.confidence && pub.classifications?.[0]?.confidence >= filters.confidence);
      
      return matchesProcessNumber && matchesText && matchesType && matchesStatus && matchesConfidence;
    });
  }, [publications, filters]);

  useEffect(() => {
    setTotalPages(Math.ceil(total / pagination.size));
  }, [total, pagination.size]);

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  const handleFilterChange = (key: keyof typeof filters, value: string | number | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination({ ...pagination, page: 1 }); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilters({
      processNumber: "",
      text: "",
      type: "",
      status: "",
      confidence: null,
    });
    setPagination({ ...pagination, page: 1 });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
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
                Tipo
              </label>
              <select
                id="type"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Todos</option>
                <option value="Sentença">Sentença</option>
                <option value="Despacho">Despacho</option>
                <option value="Decisão">Decisão</option>
                <option value="Acórdão">Acórdão</option>
                <option value="Artigo">Artigo</option>
                <option value="Doutrina">Doutrina</option>
                <option value="Legislação">Legislação</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Todos</option>
                <option value="Classificado">Classificado</option>
                <option value="Pendente">Pendente</option>
                <option value="Em Processamento">Em Processamento</option>
                <option value="Não Classificado">Não Classificado</option>
                <option value="Erro">Erro</option>
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
              <TableHead className="font-semibold text-gray-700 w-[220px] py-3">Nº Processo</TableHead>
              <TableHead className="font-semibold text-gray-700 w-[20%] py-3">Texto</TableHead>
              <TableHead className="font-semibold text-gray-700 w-[100px] py-3">Tipo</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center w-[100px] py-3">Confiança</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center w-[140px] py-3">Status</TableHead>
              <TableHead className="font-semibold text-gray-700 w-[150px] py-3">Data Inserção</TableHead>
              <TableHead className="font-semibold text-gray-700 w-[150px] py-3">Data Processamento</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center w-[120px] py-3">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPublications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {isLoading ? (
                    <div className="flex justify-center items-center">
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                      Carregando publicações...
                    </div>
                  ) : (
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
                  )}
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
                  <TableCell className="font-medium text-gray-700 py-3" style={{ wordBreak: 'break-all' }}>
                    {publication.litigationNumber}
                  </TableCell>
                  <TableCell className="text-gray-600 py-3">
                    {truncateText(publication.text || "", 120)}
                  </TableCell>
                  <TableCell className="text-gray-600 py-3">
                    {publication.classifications?.[0]?.classification || "-"}
                  </TableCell>
                  <TableCell className="text-center py-3">
                    {publication.classifications?.[0]?.confidence !== null ? (
                      <span className={cn(
                        "font-medium px-2 py-1 rounded-full text-xs inline-block min-w-[50px]",
                        publication.classifications?.[0]?.confidence && publication.classifications?.[0]?.confidence >= 0.9 ? "bg-green-100 text-green-800" :
                        publication.classifications?.[0]?.confidence && publication.classifications?.[0]?.confidence >= 0.8 ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      )}>
                        {publication.classifications?.[0]?.confidence ? `${(publication.classifications?.[0]?.confidence * 100).toFixed(0)}%` : "-"}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <Badge className={cn(getStatusColor(publication.status.id), "font-medium")}>
                      {publication.status.value}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 py-3 whitespace-nowrap">
                    {dayjs(publication.createdAt || null).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="text-gray-600 py-3 whitespace-nowrap">
                    {publication.status.id === PUBLICATION_STATUS.COMPLETED ? dayjs(publication.updatedAt || null).format("DD/MM/YYYY HH:mm") : "-"}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onConfirm(publication.id)}
                        disabled={[PUBLICATION_STATUS.PROCESSING, PUBLICATION_STATUS.PENDING].includes(publication.status.id)}
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Confirmar"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onReclassify(publication.id)}
                        disabled={[PUBLICATION_STATUS.PROCESSING].includes(publication.status.id)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Reclassificar"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDiscard(publication.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Descartar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredPublications.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex items-center text-sm text-gray-500">
            Mostrando {Math.min(filteredPublications.length, (pagination.page - 1) * pagination.size + 1)} a {Math.min(filteredPublications.length, pagination.page * pagination.size)} de {filteredPublications.length} resultados
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pagination.size}
              onChange={(e) => {
                setPagination({ ...pagination, size: Number(e.target.value), page: 1 });
              }}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="h-10 w-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {(() => {
                const pages = [];
                const totalPagesCount = totalPages;

                // Always show first page
                pages.push(1);

                // Show ellipsis and pages around current page if not near start
                if (pagination.page > 2) {
                  pages.push('...');
                  // Show one page before current page
                  pages.push(pagination.page - 1);
                }

                // Show current page if not already included
                if (!pages.includes(pagination.page)) {
                  pages.push(pagination.page);
                }

                // Show one page after current page if not near end
                if (pagination.page < totalPagesCount - 1) {
                  pages.push(pagination.page + 1);
                  pages.push('...');
                }

                // Always show last page if there is more than one page
                if (totalPagesCount > 1 && !pages.includes(totalPagesCount)) {
                  pages.push(totalPagesCount);
                }

                return pages.map((pageNumber, index) => (
                  pageNumber === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
                  ) : (
                    <Button
                      key={pageNumber}
                      variant={pagination.page === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber as number)}
                      className={cn(
                        "h-10 w-10 p-0",
                        pagination.page === pageNumber && "bg-primary-blue hover:bg-blue-700"
                      )}
                    >
                      {pageNumber}
                    </Button>
                  )
                ));
              })()}
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
                className="h-10 w-10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 