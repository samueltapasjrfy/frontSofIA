import { Download } from "lucide-react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { PublicationV2Api } from "@/api/publicationV2Api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getStatusColor } from "@/constants/publicationsV2"

export interface ModalPublicationInfoProps {
    selectedPublication: PublicationV2Api.Publication | null
    setSelectedPublication: (publication: PublicationV2Api.Publication | null) => void
}

export const ModalPublicationInfo = ({ selectedPublication, setSelectedPublication }: ModalPublicationInfoProps) => {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Texto copiado para a área de transferência")
    }
    return (
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
                                        <Badge className={cn("font-medium", getStatusColor(selectedPublication.status.id))}>
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
    )
}