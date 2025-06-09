import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search } from "lucide-react"
import { useState } from "react"

export const FilterComponent = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [categoriaFilter, setCategoriaFilter] = useState("")
    const [classificacaoFilter, setClassificacaoFilter] = useState("")
    const [remetenteFilter, setRemetenteFilter] = useState("")
    return (
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm" >
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-64">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar texto, parte ou processo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-transparent border-gray-200 dark:border-gray-700 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500"
                            />
                        </div>
                    </div>
                    <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                        <SelectTrigger className="w-48 border-gray-200 dark:border-gray-700 focus:ring-gray-400 dark:focus:ring-gray-500">
                            <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as categorias</SelectItem>
                            <SelectItem value="DECISÃO JUDICIAL">Decisão Judicial</SelectItem>
                            <SelectItem value="ORDEM COM PRAZO">Ordem com Prazo</SelectItem>
                            <SelectItem value="MERO EXPEDIENTE">Mero Expediente</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={classificacaoFilter} onValueChange={setClassificacaoFilter}>
                        <SelectTrigger className="w-48 border-gray-200 dark:border-gray-700 focus:ring-gray-400 dark:focus:ring-gray-500">
                            <SelectValue placeholder="Classificação" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as classificações</SelectItem>
                            <SelectItem value="Audiência">Audiência</SelectItem>
                            <SelectItem value="Sentença">Sentença</SelectItem>
                            <SelectItem value="Determinação de Pagamento">Determinação de Pagamento</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={remetenteFilter} onValueChange={setRemetenteFilter}>
                        <SelectTrigger className="w-48 border-gray-200 dark:border-gray-700 focus:ring-gray-400 dark:focus:ring-gray-500">
                            <SelectValue placeholder="Remetente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os remetentes</SelectItem>
                            <SelectItem value="Autor">Autor</SelectItem>
                            <SelectItem value="Réu">Réu</SelectItem>
                            <SelectItem value="Exequente">Exequente</SelectItem>
                            <SelectItem value="Executado">Executado</SelectItem>
                            <SelectItem value="Ambos">Ambos</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Exportar CSV</span>
                        <span className="sm:hidden">Exportar</span>
                    </Button>
                </div>
            </CardContent>
        </Card >
    )
}