"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    FileText,
    BarChart3,
    Download,
    Filter,
    RotateCcw,
    Eye,
    ThumbsUp,
    ThumbsDown,
    Trash2,
    ChevronDown,
    ChevronRight,
    Calendar,
    Building2,
    Hash,
    Timer,
    Target,
    Users,
    Loader2,
} from "lucide-react"

import { PublicationV2Api } from '@/api/publicationV2Api'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"

export interface TableV2Props {
    publications?: PublicationV2Api.Publication[]
    filterComponent?: React.ReactNode
    onPublicationAction?: (action: string, publication: PublicationV2Api.Publication) => void
    onBlockAction?: (action: string, block: PublicationV2Api.Block) => void
    onExport?: () => void
    onReload?: () => void
    loading?: boolean
}
export const TableV2 = ({
    publications: propPublications,
    onPublicationAction,
    onBlockAction,
    filterComponent,
    onExport,
    onReload,
    loading,
}: TableV2Props) => {
    const [expandedPublications, setExpandedPublications] = useState<Set<string>>(new Set())
    const [selectedPublication, setSelectedPublication] = useState<PublicationV2Api.Publication | null>(null)
    const [selectedBlock, setSelectedBlock] = useState<
        PublicationV2Api.Block &
        { idPublication: string, cnj?: string } | null>(null)
    const [showFilter, setShowFilter] = useState(false)
    const [isReloading, setIsReloading] = useState(false)
    const publications = propPublications || []

    const handleReload = () => {
        setIsReloading(true)
        onReload?.()
        setTimeout(() => {
            setIsReloading(false)
        }, 10000)
    }

    const toggleExpanded = (id: string) => {
        const newExpanded = new Set(expandedPublications)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedPublications(newExpanded)
    }

    const getCategoriaColor = (categoria: string) => {
        const colors: Record<string, string> = {
            "DECISÃO JUDICIAL":
                "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
            "ORDEM COM PRAZO":
                "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
            "MERO EXPEDIENTE":
                "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
        }
        return colors[categoria] || "bg-gray-50 text-gray-700 border-gray-200"
    }

    const getClassificacaoColor = (classificacao: string) => {
        const colors: Record<string, string> = {
            Audiência:
                "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30",
            Sentença:
                "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
            "Determinação de Pagamento":
                "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30",
        }
        return colors[classificacao] || "bg-gray-50 text-gray-700 border-gray-200"
    }

    const getConfiancaColor = (confianca: { id: number, name: string } | null) => {
        if (!confianca)
            return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/30"
        if (confianca.id === 3)
            return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30"
        if (confianca.id === 2)
            return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30"
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30"
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    const handlePublicationAction = (action: string, publication: PublicationV2Api.Publication) => {
        if (onPublicationAction) {
            onPublicationAction(action, publication)
        }
    }

    const handleBlockAction = (action: string, block: PublicationV2Api.Block) => {
        if (onBlockAction) {
            onBlockAction(action, block)
        }
    }

    return (
        <div className="space-y-6">
            {/* Publications Table */}
            <Card className="bg-white dark:bg-gray-800 border-none shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Publicações ({publications.length})
                        </h3>
                        <div className="flex gap-2">

                            {!!filterComponent && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2 h-8 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                    onClick={() => setShowFilter(!showFilter)}
                                >
                                    <Filter className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Filtros</span>
                                </Button>
                            )}
                            {!!onExport && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2 h-8 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Exportar</span>
                                </Button>
                            )}
                            {!!onReload && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2 h-8 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                    onClick={handleReload}
                                    disabled={isReloading}
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Recarregar</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                {showFilter && (
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        {filterComponent}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12"></th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    ID Publicação
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Nº Processo
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Tribunal
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Modalidade
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Blocos
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Data Inserção
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" >
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-4 text-center">
                                        <Loader2
                                            className="h-4 w-4 mx-auto animate-spin text-gray-400"
                                            style={{ width: '32px', height: '32px' }}
                                        />
                                    </td>
                                </tr>
                            ) : (publications.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-4 text-center">
                                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                                            Nenhuma publicação encontrada
                                        </p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">
                                            Tente ajustar os filtros ou cadastre uma publicação
                                        </p>
                                    </td>
                                </tr>
                            ) : publications.map((publication) => (
                                <>
                                    {/* Master Row - Publication */}
                                    <tr
                                        key={publication.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-4 py-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleExpanded(publication.id)}
                                                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                            >
                                                {expandedPublications.has(publication.id) ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {publication.id}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 font-mono">
                                            {publication.info.cnj}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-gray-400" />
                                                {publication.info.court}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{publication.caseType.name}</td>
                                        <td className="px-4 py-4 text-sm">
                                            <Badge
                                                variant="outline"
                                                className="font-medium border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30"
                                            >
                                                {publication.blocks.length} bloco{publication.blocks.length !== 1 ? "s" : ""}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            <Badge className="font-medium bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700">
                                                {publication.status.name}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {new Date(publication.createdAt).toLocaleDateString('pt-BR')}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                                                    onClick={() => setSelectedPublication(publication)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {/* <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20"
                                                    onClick={() => handlePublicationAction('approve', publication)}
                                                >
                                                    <ThumbsUp className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                                                    onClick={() => handlePublicationAction('reject', publication)}
                                                >
                                                    <ThumbsDown className="h-4 w-4" />
                                                </Button> */}
                                                {/* <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                                                    onClick={() => handlePublicationAction('delete', publication)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button> */}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded Content - Blocks */}
                                    {expandedPublications.has(publication.id) && (
                                        <tr>
                                            <td colSpan={9} className="px-0 py-0">
                                                <div className="bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                                                    <div className="p-6 space-y-4">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <Hash className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                Blocos da Publicação ({publication.blocks.length})
                                                            </span>
                                                        </div>

                                                        {publication.blocks.map((block: PublicationV2Api.Block, index: number) => (
                                                            <div
                                                                key={block.id}
                                                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition-shadow"
                                                            >
                                                                {/* Block Header */}
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                                                                                {index + 1}
                                                                            </div>
                                                                            <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                                                                                {block.id}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                                                                            onClick={() => setSelectedBlock({ ...block, cnj: publication.info.cnj, idPublication: publication.id })}
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                        {/* <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20"
                                                                            onClick={() => handleBlockAction('approve', block)}
                                                                        >
                                                                            <ThumbsUp className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                                                                            onClick={() => handleBlockAction('reject', block)}
                                                                        >
                                                                            <ThumbsDown className="h-4 w-4" />
                                                                        </Button> */}
                                                                        {/* <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                                                                            onClick={() => handleBlockAction('delete', block)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button> */}
                                                                    </div>
                                                                </div>

                                                                {/* Block Metadata */}
                                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <Target className="h-4 w-4 text-gray-400" />
                                                                        <div>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Categoria</p>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className={getCategoriaColor(block.category?.name)}
                                                                            >
                                                                                {block.category?.name || '-'}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="h-4 w-4 text-gray-400" />
                                                                        <div>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Classificação</p>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className={getClassificacaoColor(block.classification?.name)}
                                                                            >
                                                                                {block.classification?.name || '-'}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        <Hash className="h-4 w-4 text-gray-400" />
                                                                        <div>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Subclasse</p>
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                {block.subClassification?.name || '-'}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="h-4 w-4 text-gray-400" />
                                                                        <div>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Confiança</p>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className={getConfiancaColor(block.classification?.confidence)}
                                                                            >
                                                                                {block.classification?.confidence?.name || '-'}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>

                                                                    {/* {block.deadline && (
                                                                        <div className="flex items-center gap-2">
                                                                            <Timer className="h-4 w-4 text-gray-400" />
                                                                            <div>
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Prazo</p>
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30"
                                                                                >
                                                                                    {block.deadline}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    )} */}
                                                                </div>

                                                                {/* Block Content */}
                                                                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-md p-3">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Texto Completo</p>
                                                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                                        {block.text}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )
                            ))}
                        </tbody>
                    </table>
                </div>

            </Card>

            {/* Detail Modal */}
            <Dialog open={!!selectedPublication} onOpenChange={() => setSelectedPublication(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 p-0 border-none">
                    {selectedPublication && (
                        <>
                            <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {`Publicação - ${selectedPublication.id}`}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {`Processo ${selectedPublication.info.cnj}`}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="p-6 space-y-6">
                                {/* Metadata Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-5 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ID Publicação</label>
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                            {selectedPublication.id}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nº Processo</label>
                                        <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                                            {selectedPublication.info.cnj}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo de Caso</label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedPublication.caseType.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                                        <p className="mt-1">
                                            <Badge className="font-medium bg-amber-500 dark:bg-amber-600">
                                                {selectedPublication.status.name}
                                            </Badge>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tribunal</label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedPublication.info.court}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Blocos</label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedPublication.blocks.length}</p>
                                    </div>
                                </div>

                                {/* Full Text */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Texto Completo</label>
                                    <div className="mt-2 p-5 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {selectedPublication.text}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            copyToClipboard(
                                                selectedPublication.text,
                                            )
                                        }
                                        className="flex items-center gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                    >
                                        <Download className="h-4 w-4" />
                                        Copiar Texto
                                    </Button>
                                    {/* <Button
                                        variant="outline"
                                        className="flex items-center gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/30 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                                        onClick={() => {
                                            if (selectedItem.type === "publication") {
                                                handlePublicationAction('approve', selectedItem.data)
                                            } else {
                                                handleBlockAction('approve', selectedItem.data)
                                            }
                                            setSelectedItem(null)
                                        }}
                                    >
                                        <ThumbsUp className="h-4 w-4" />
                                        Aprovar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800/30 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                        onClick={() => {
                                            if (selectedItem.type === "publication") {
                                                handlePublicationAction('reject', selectedItem.data)
                                            } else {
                                                handleBlockAction('reject', selectedItem.data)
                                            }
                                            setSelectedItem(null)
                                        }}
                                    >
                                        <ThumbsDown className="h-4 w-4" />
                                        Rejeitar
                                    </Button> */}
                                    <Button
                                        className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                                        onClick={() => setSelectedPublication(null)}
                                    >
                                        Fechar
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>


            <Dialog open={!!selectedBlock} onOpenChange={() => setSelectedBlock(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 p-0 border-none">
                    {selectedBlock && (
                        <>
                            <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {`Bloco - ${selectedBlock.id}`}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {`Publicação - ${selectedBlock.idPublication}`}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="p-6 space-y-6">
                                {/* Metadata Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-5 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Categoria</label>
                                        <div className="mt-1">
                                            <Badge variant="outline" className={getCategoriaColor(selectedBlock.category?.name)}>
                                                {selectedBlock.category?.name}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Classificação</label>
                                        <div className="mt-1">
                                            <Badge variant="outline" className={getClassificacaoColor(selectedBlock.classification?.name)}>
                                                {selectedBlock.classification?.name}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subclasse</label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedBlock.subClassification?.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Confiança</label>
                                        <div className="mt-1">
                                            <Badge variant="outline" className={getConfiancaColor(selectedBlock.classification?.confidence)}>
                                                {selectedBlock.classification?.confidence?.name}
                                            </Badge>
                                        </div>
                                    </div>
                                    {/* <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Prazo</label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {"-"}
                                        </p>
                                    </div> */}
                                </div>

                                {/* Full Text */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Texto Completo</label>
                                    <div className="mt-2 p-5 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {selectedBlock.text}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            copyToClipboard(
                                                selectedBlock.text,
                                            )
                                        }
                                        className="flex items-center gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                    >
                                        <Download className="h-4 w-4" />
                                        Copiar Texto
                                    </Button>
                                    {/* <Button
                                        variant="outline"
                                        className="flex items-center gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/30 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                                        onClick={() => {
                                            if (selectedItem.type === "publication") {
                                                handlePublicationAction('approve', selectedItem.data)
                                            } else {
                                                handleBlockAction('approve', selectedItem.data)
                                            }
                                            setSelectedItem(null)
                                        }}
                                    >
                                        <ThumbsUp className="h-4 w-4" />
                                        Aprovar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800/30 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                        onClick={() => {
                                            if (selectedItem.type === "publication") {
                                                handlePublicationAction('reject', selectedItem.data)
                                            } else {
                                                handleBlockAction('reject', selectedItem.data)
                                            }
                                            setSelectedItem(null)
                                        }}
                                    >
                                        <ThumbsDown className="h-4 w-4" />
                                        Rejeitar
                                    </Button> */}
                                    <Button
                                        className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                                        onClick={() => setSelectedBlock(null)}
                                    >
                                        Fechar
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}