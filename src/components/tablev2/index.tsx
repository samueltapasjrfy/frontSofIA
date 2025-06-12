"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    FileText,
    Download,
    Filter,
    RotateCcw,
    Eye,
    ChevronDown,
    ChevronRight,
    Calendar,
    Building2,
    Hash,
    Target,
    Users,
    Loader2,
    Trash2,
    ThumbsUp,
    ThumbsDown,
    Check,
} from "lucide-react"

import { PublicationV2Api } from '@/api/publicationV2Api'
import { cn } from "@/utils/cn"
import { getStatusColor } from "@/constants/publicationsV2"
import { ModalPublicationInfo } from "./modalPublicationInfo"
import { getCategoriaColor, getClassificacaoColor, getConfiancaColor, getValidationColor } from "./common"
import { ModalBlockInfo } from "./modalBlockInfo"
import PopConfirm from "../ui/popconfirm"
import { TruncateText } from "../truncateText"
import ModalViewText from "../modalViewText"

const headers = [
    "ID Publicação",
    "Nº Processo",
    "Texto",
    "Modalidade",
    "Blocos",
    "Status",
    "Data Inserção",
    "Ações",
]
export interface TableV2Props {
    publications?: PublicationV2Api.Publication[]
    filterComponent?: React.ReactNode
    onPublicationAction?: (action: string, publication: PublicationV2Api.Publication) => void
    onBlockAction?: (action: string, block: PublicationV2Api.Block) => void
    onExport?: () => Promise<void>
    onReload?: () => Promise<void>
    onDelete?: (id: string) => Promise<boolean>
    onDeleteBlock?: (id: string) => Promise<boolean>
    onValidateBlock?: (id: string, status: 'approve' | 'reprove') => Promise<boolean>
    onValidatePublication?: (id: string, status: 'approve' | 'reprove') => Promise<boolean>
    loading?: boolean
    total?: number
}
export const TableV2 = ({
    publications: propPublications,
    filterComponent,
    onExport,
    onReload,
    onDelete,
    onDeleteBlock,
    onValidateBlock,
    onValidatePublication,
    loading,
    total,
}: TableV2Props) => {
    const [expandedPublications, setExpandedPublications] = useState<Set<string>>(new Set())
    const [selectedPublication, setSelectedPublication] = useState<PublicationV2Api.Publication | null>(null)
    const [selectedBlock, setSelectedBlock] = useState<
        PublicationV2Api.Block &
        { idPublication: string, cnj?: string } | null>(null)
    const [showFilter, setShowFilter] = useState(false)
    const [isReloading, setIsReloading] = useState(false)
    const publications = propPublications || []
    const [selectedText, setSelectedText] = useState<string>("")
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

    return (
        <div className="space-y-6">
            {/* Publications Table */}
            <Card className="bg-white dark:bg-gray-800 border-none shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Publicações ({total || publications.length})
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
                                {headers.map((header, i) => (
                                    <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
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
                                            <TruncateText
                                                text={publication.text || ""}
                                                maxLength={15}
                                                onClick={() => {
                                                    setSelectedText(publication.text || "");
                                                }}
                                            />
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
                                            <Badge className={cn("font-medium", getStatusColor(publication.status.id))}>
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
                                                {!!onValidatePublication && (
                                                    <>
                                                        <PopConfirm
                                                            title="Tem certeza que deseja aprovar a publicação?"
                                                            onConfirm={async () => {
                                                                await onValidatePublication?.(publication.id, 'approve')
                                                            }}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20"
                                                            >
                                                                <ThumbsUp className="h-4 w-4" />
                                                            </Button>
                                                        </PopConfirm>
                                                        <PopConfirm
                                                            title="Tem certeza que deseja rejeitar a publicação?"
                                                            onConfirm={async () => {
                                                                await onValidatePublication?.(publication.id, 'reprove')
                                                            }}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                                                            >
                                                                <ThumbsDown className="h-4 w-4" />
                                                            </Button>
                                                        </PopConfirm>
                                                    </>
                                                )}
                                                {!!onDelete && (
                                                    <PopConfirm
                                                        title="Tem certeza que deseja deletar a publicação?"
                                                        onConfirm={async () => {
                                                            await onDelete?.(publication.id)
                                                        }}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </PopConfirm>
                                                )}
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
                                                                        {!!onValidateBlock && (
                                                                            <>
                                                                                <PopConfirm
                                                                                    title="Tem certeza que deseja aprovar o bloco?"
                                                                                    onConfirm={async () => {
                                                                                        await onValidateBlock?.(block.id, 'approve')
                                                                                    }}
                                                                                >
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        className="h-8 w-8 p-0 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20"
                                                                                    >
                                                                                        <ThumbsUp className="h-4 w-4" />
                                                                                    </Button>
                                                                                </PopConfirm>
                                                                                <PopConfirm
                                                                                    title="Tem certeza que deseja rejeitar o bloco?"
                                                                                    onConfirm={async () => {
                                                                                        await onValidateBlock?.(block.id, 'reprove')
                                                                                    }}
                                                                                >
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                                                                                    >
                                                                                        <ThumbsDown className="h-4 w-4" />
                                                                                    </Button>
                                                                                </PopConfirm>
                                                                            </>
                                                                        )}
                                                                        {!!onDeleteBlock && (
                                                                            <PopConfirm
                                                                                title="Tem certeza que deseja deletar o bloco?"
                                                                                onConfirm={async () => {
                                                                                    await onDeleteBlock?.(block.id)
                                                                                }}
                                                                            >
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </PopConfirm>
                                                                        )}
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
                                                                    {block.recipient?.name && (
                                                                        <div className="flex items-center gap-2">
                                                                            <Check className="h-4 w-4 text-gray-400" />
                                                                            <div>
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Remetente</p>
                                                                                <Badge
                                                                                    variant="outline"
                                                                                >
                                                                                    {block.recipient?.name ?
                                                                                        String(block.recipient?.name).slice(0, 1).toUpperCase() + String(block.recipient?.name).slice(1).toLowerCase()
                                                                                        : '-'
                                                                                    }
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-2">
                                                                        <Check className="h-4 w-4 text-gray-400" />
                                                                        <div>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Validação</p>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className={getValidationColor(block.validation?.id)}
                                                                            >
                                                                                {block.validation?.name || '-'}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>


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
            <ModalPublicationInfo
                selectedPublication={selectedPublication}
                setSelectedPublication={setSelectedPublication}
                onDelete={onDelete}
                onValidate={onValidatePublication}
            />

            <ModalBlockInfo
                selectedBlock={selectedBlock}
                setSelectedBlock={setSelectedBlock}
                onDelete={onDeleteBlock}
                onValidate={onValidateBlock}
            />

            <ModalViewText
                isOpen={!!selectedText}
                onClose={() => setSelectedText("")}
                text={selectedText}
            />
        </div>
    )
}