"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Publication, PublicationStatus } from "@/contexts/DashboardContext";
import { Eye, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentPublicationsProps {
  title: string;
  description?: string;
  publications: Publication[];
  className?: string;
}

export function RecentPublications({
  title,
  description,
  publications,
  className,
}: RecentPublicationsProps) {
  // Função para determinar a cor do badge de status
  const getStatusColor = (status: PublicationStatus) => {
    switch (status) {
      case "Classificado":
        return "bg-primary-green text-white";
      case "Pendente":
        return "bg-yellow-400 text-black";
      case "Em Processamento":
        return "bg-primary-blue text-white";
      case "Não Classificado":
        return "bg-gray-500 text-white";
      case "Erro":
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

  return (
    <Card className={cn("overflow-hidden bg-white border shadow-sm rounded-lg", className)}>
      <CardHeader className="bg-white pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">{title}</CardTitle>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
          <Button variant="outline" size="sm" className="text-primary-blue border-primary-blue hover:bg-blue-50">
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
                <TableHead className="font-semibold text-gray-700 w-[220px] py-3 whitespace-nowrap">Nº Processo</TableHead>
                <TableHead className="font-semibold text-gray-700 w-[40%] py-3">Texto</TableHead>
                <TableHead className="font-semibold text-gray-700 w-[100px] py-3">Tipo</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center w-[100px] py-3">Confiança</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center w-[140px] py-3">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publications.map((publication, index) => (
                <TableRow 
                  key={publication.processNumber}
                  className={cn(
                    "hover:bg-gray-50 transition-colors cursor-pointer",
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  )}
                >
                  <TableCell className="font-medium text-gray-700 py-3 whitespace-nowrap">
                    {publication.processNumber}
                  </TableCell>
                  <TableCell className="text-gray-600 py-3">
                    {truncateText(publication.text, 120)}
                  </TableCell>
                  <TableCell className="text-gray-600 py-3">
                    {publication.type}
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <span className={cn(
                      "font-medium px-2 py-1 rounded-full text-xs inline-block min-w-[50px]",
                      publication.confidence >= 90 ? "bg-green-100 text-green-800" :
                      publication.confidence >= 80 ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    )}>
                      {publication.confidence}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <Badge className={cn(getStatusColor(publication.status), "font-medium")}>
                      {publication.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 