"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Eye, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicationsApi } from "@/api/publicationsApi";
import { classificationStatusColors } from "@/constants/publications";
import ModalViewText from "../modalViewText";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { toPercent } from "@/utils/toPercent";

interface RecentPublicationsProps {
  title: string;
  description?: string;
  publications: PublicationsApi.FindAll.Publication[];
  className?: string;
}

// Interface para definir a estrutura de cada coluna
interface Column {
  key: string;
  label: string;
  className?: string;
  render: (publication: PublicationsApi.FindAll.Publication) => ReactNode;
}

export function RecentPublications({
  title,
  description,
  publications,
  className,
}: RecentPublicationsProps) {
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const router = useRouter();

  const truncateText = (text: string, maxLength: number = 100) => {
    return (
      <div className="flex items-center gap-2">
        <span className="line-clamp-2">{text.substring(0, maxLength)}...</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-blue font-medium hover:bg-blue-50 p-1 h-auto"
          onClick={() => {
            setSelectedText(text || "");
            setIsTextModalOpen(true);
          }}
        >
          <span className="sr-only">Ver mais</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Definição das colunas da tabela
  const columns: Column[] = [
    {
      key: 'litigationNumber',
      label: 'Nº Processo',
      className: 'font-semibold text-gray-700 w-[220px] py-3 whitespace-nowrap',
      render: (publication) => (
        <span className="font-medium text-gray-700">{publication.litigationNumber}</span>
      )
    },
    {
      key: 'text',
      label: 'Texto',
      className: 'font-semibold text-gray-700 w-[40%] py-3',
      render: (publication) => (
        <span className="text-gray-600">{truncateText(publication.text || "", 120)}</span>
      )
    },
    {
      key: 'caseType',
      label: 'Tipo',
      className: 'font-semibold text-gray-700 w-[100px] py-3',
      render: (publication) => (
        <span className="text-gray-600">{publication.caseType?.value}</span>
      )
    },
    {
      key: 'confidence',
      label: 'Confiança',
      className: 'font-semibold text-gray-700 text-center w-[100px] py-3',
      render: (publication) => {
        const confidence = publication.classifications?.[0]?.confidence || 0;
        const confidencePercentage = toPercent(confidence);
        return (
          <span className={cn(
            "font-medium px-2 py-1 rounded-full text-xs inline-block min-w-[50px]",
            confidencePercentage >= 90 ? "bg-green-100 text-green-800" :
              confidencePercentage >= 80 ? "bg-blue-100 text-blue-800" :
                "bg-yellow-100 text-yellow-800"
          )}>
            {confidencePercentage}%
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      className: 'font-semibold text-gray-700 text-center w-[140px] py-3',
      render: (publication) => {
        const status = publication.classifications?.[0]?.status;
        return (
          <Badge className={cn(classificationStatusColors[status?.id || 0], "font-medium")}>
            {status?.value}
          </Badge>
        );
      }
    }
  ];

  return (
    <>
      <Card className={cn("overflow-hidden bg-white border shadow-sm rounded-lg", className)}>
        <CardHeader className="bg-white pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">{title}</CardTitle>
              {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-primary-blue border-primary-blue hover:bg-blue-50"
              onClick={() => router.push("/publicacoes")}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver todas
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
                {publications.length > 0 ? (
                  publications.map((publication, index) => (
                    <TableRow
                      key={publication.id}
                      className={cn(
                        "hover:bg-gray-50 transition-colors cursor-pointer",
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
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      Nenhuma publicação recente encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <ModalViewText
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        text={selectedText}
      />
    </>
  );
} 