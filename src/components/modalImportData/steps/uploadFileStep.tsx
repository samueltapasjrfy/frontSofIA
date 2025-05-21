import FileDropzone from "@/components/dropZone"
import { Button } from "@/components/ui/button"
import { LucideDownload } from "lucide-react"
import { ExpectedColumns } from "../types";

type UploadFileStepProps = {
    docExampleUrl?: string;
    expectedColumns: ExpectedColumns[];
    handleUpload: (file: File) => void;
    isUploading: boolean;
}
export const UploadFileStep = ({ docExampleUrl, expectedColumns, handleUpload, isUploading }: UploadFileStepProps) => {
    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-medium">Dados que esperamos</span>
                {docExampleUrl && (
                    <Button
                        variant="default"
                        className="flex items-center gap-2"
                    >
                        <LucideDownload size={16} /> Baixar exemplo de planilha
                    </Button>
                )}
            </div>
            <div className="flex overflow-auto gap-4 mb-4">
                {expectedColumns.map((column) => (
                    <div
                        key={column.key}
                        className="flex flex-col items-center p-2"
                        style={{ minWidth: column.previewWidth || 200 }}
                    >
                        <span className="font-bold">{column.key}</span>
                        <span className="text-sm text-gray-500">{column.example}</span>
                    </div>
                ))}
            </div>
            <p className="text-sm text-gray-500 mb-4">
                Você poderá renomear ou remover colunas no próximo passo
            </p>
            <FileDropzone onFileDrop={handleUpload} isUploading={isUploading} />
        </>
    )
}