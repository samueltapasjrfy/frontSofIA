import { Download, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { PublicationV2Api } from "@/api/publicationV2Api"
import { toast } from "sonner"
import { getCategoriaColor, getClassificacaoColor, getConfiancaColor, getValidationColor } from "./common"
import PopConfirm from "../ui/popconfirm"

type BlockWithPublication = PublicationV2Api.Block & { idPublication: string }
export interface ModalBlockInfoProps {
    selectedBlock: BlockWithPublication | null
    setSelectedBlock: (block: BlockWithPublication | null) => void
    onDelete?: (id: string) => Promise<boolean>
    onValidate?: (id: string, status: 'approve' | 'reprove') => Promise<boolean>
}

export const ModalBlockInfo = ({ selectedBlock, setSelectedBlock, onDelete, onValidate }: ModalBlockInfoProps) => {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Texto copiado para a área de transferência")
    }
    return (
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
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Validação</label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className={getValidationColor(selectedBlock.validation?.id)}>
                                            {selectedBlock.validation?.name}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Remetente</label>
                                    <div className="mt-1">
                                        <Badge variant="outline">
                                            {selectedBlock.recipient?.name}
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
                            <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    {!!onDelete && (
                                        <PopConfirm
                                            title="Tem certeza que deseja deletar o bloco?"
                                            modal={true}
                                            onConfirm={async () => {
                                                const response = await onDelete(selectedBlock.id)
                                                if (response) {
                                                    setSelectedBlock(null)
                                                }
                                            }}
                                        >
                                            <Button
                                                variant="outline"
                                                className="flex items-center gap-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Deletar Bloco
                                            </Button>
                                        </PopConfirm>
                                    )}
                                </div>
                                <div className="flex gap-3">
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
                                    {!!onValidate && (
                                        <>
                                            <PopConfirm
                                                title="Tem certeza que deseja aprovar o bloco?"
                                                modal={true}
                                                onConfirm={async () => {
                                                    const response = await onValidate?.(selectedBlock.id, 'approve')
                                                    if (response) {
                                                        setSelectedBlock(null)
                                                    }
                                                }}
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="flex items-center gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/30 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                                                >
                                                    <ThumbsUp className="h-4 w-4" />
                                                    Aprovar
                                                </Button>
                                            </PopConfirm>
                                            <PopConfirm
                                                title="Tem certeza que deseja rejeitar o bloco?"
                                                modal={true}
                                                onConfirm={async () => {
                                                    const response = await onValidate?.(selectedBlock.id, 'reprove')
                                                    if (response) {
                                                        setSelectedBlock(null)
                                                    }
                                                }}
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="flex items-center gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800/30 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                >
                                                    <ThumbsDown className="h-4 w-4" />
                                                    Rejeitar
                                                </Button>
                                            </PopConfirm>
                                        </>
                                    )}

                                    <Button
                                        className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                                        onClick={() => setSelectedBlock(null)}
                                    >
                                        Fechar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}