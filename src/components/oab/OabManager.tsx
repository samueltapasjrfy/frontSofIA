"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Scale, Plus, MapPin, Calendar, FileText, Trash2, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import PopConfirm from "@/components/ui/popconfirm"
import { OAB_STATUS, OAB_STATUS_LABEL } from "@/constants/oab"
import { Skeleton } from "@/components/ui/skeleton"

// Interface para os dados de OAB
export interface OabData {
  id: string
  oabNumber: string
  state: string
  lawyer: string
  registrationDate: Date
  publications: number
  status: number
}

interface OabManagerProps {
  oabs: OabData[]
  onAddOab: () => void
  onDeleteOab: (id: string) => Promise<void>
  onReload?: () => void
  loading?: boolean
}

export function OabManager({ oabs, onAddOab, onDeleteOab, onReload, loading = false }: OabManagerProps) {

  // Estado vazio
  if (oabs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <Scale className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma OAB cadastrada
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6 max-w-md">
            Cadastre sua OAB para começar a receber publicações automaticamente. Você pode cadastrar múltiplas OABs para monitorar diferentes advogados.
          </p>
          <Button onClick={onAddOab} className="gap-2" disabled={loading}>
            <Plus className="w-4 h-4" />
            Cadastrar OAB
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Estado com dados
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50">
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>OABs Cadastradas</CardTitle>
              <CardDescription>
                {oabs.length} {oabs.length === 1 ? "registro monitorado" : "registros monitorados"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onReload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReload}
                disabled={loading}
                className="gap-2"
              >
                <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Recarregar
              </Button>
            )}
            <Button onClick={onAddOab} className="gap-2" disabled={loading}>
              <Plus className="w-4 h-4" />
              Nova OAB
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-y-auto border rounded-md" style={{ maxHeight: '20rem' }}>
          <div className="relative w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="sticky top-0 bg-white z-10 border-b">
                <tr>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground bg-white">OAB</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground bg-white">Estado</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground bg-white">Advogado</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground bg-white">Data Cadastro</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground bg-white">Publicações</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground bg-white">Status</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground bg-white">Ações</th>
                </tr>
              </thead>
              <tbody>
              {loading ? (
                // Skeleton rows
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b transition-colors">
                    <td className="p-4 align-middle">
                      <Skeleton className="h-5 w-24" />
                    </td>
                    <td className="p-4 align-middle">
                      <Skeleton className="h-6 w-16" />
                    </td>
                    <td className="p-4 align-middle">
                      <Skeleton className="h-5 w-32" />
                    </td>
                    <td className="p-4 align-middle">
                      <Skeleton className="h-5 w-24" />
                    </td>
                    <td className="p-4 align-middle">
                      <Skeleton className="h-5 w-12" />
                    </td>
                    <td className="p-4 align-middle">
                      <Skeleton className="h-6 w-20" />
                    </td>
                    <td className="p-4 align-middle">
                      <Skeleton className="h-8 w-8 rounded" />
                    </td>
                  </tr>
                ))
              ) : (
                oabs.map((oab) => (
                  <tr key={oab.id} className="border-b transition-colors">
                    <td className="p-4 align-middle font-medium">
                      # {oab.oabNumber}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="outline" className="gap-1 bg-gray-50">
                        <MapPin className="w-3 h-3" />
                        {oab.state}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">{oab.lawyer}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(oab.registrationDate, "dd/MM/yyyy")}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {oab.publications}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge 
                        variant={
                          oab.status === OAB_STATUS.ACTIVE 
                            ? "success" 
                            : oab.status === OAB_STATUS.PROCESSING 
                            ? "pending" 
                            : "outline"
                        }
                      >
                        {OAB_STATUS_LABEL[oab.status as keyof typeof OAB_STATUS_LABEL] || "Desconhecido"}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <PopConfirm
                        title="Excluir OAB"
                        description="Tem certeza que deseja excluir esta OAB? Esta ação não pode ser desfeita."
                        onConfirm={async () => {
                          await onDeleteOab(oab.id)
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </PopConfirm>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
