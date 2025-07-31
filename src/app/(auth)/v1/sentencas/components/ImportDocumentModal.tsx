"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Trash, Upload } from "lucide-react";
import FileDropzone from "@/components/drop-zone";
import { toast } from "sonner";

interface ImportDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: { file: File }) => Promise<{ error?: string }>;
  onSuccess: () => void;
}
type FileStatus = 'pending' | 'uploading' | 'success' | 'error'
type PageFile = {
  file: File
  size: number
  status: FileStatus
  error?: string
  send: boolean
}
export function ImportDocumentModal({ isOpen, onClose, onImport, onSuccess }: ImportDocumentModalProps) {
  const [files, setFiles] = useState<Array<PageFile>>([]);
  const [selectFilesDisabled, setSelectFilesDisabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const changeFileStatus = async (fileIndex: number, status: 'pending' | 'uploading' | 'success' | 'error', error?: string) => {
    setFiles(prevFiles => {
      const newFiles = prevFiles.map((f, index) => index === fileIndex ? { ...f, status, error } : f)
      return newFiles
    })
  }

  const handleSubmit = async () => {
    setSelectFilesDisabled(true)

    const newFiles = files.filter(f => f.send).map((f) => {
      if (['error'].includes(f.status) && f.send) {
        return { ...f, status: 'pending' as FileStatus, error: undefined }
      }
      return f
    })
    setFiles(newFiles)

    if (newFiles.length === 0) {
      toast.error("Nenhum arquivo selecionado")
      return
    }
    if (!newFiles.some(f => ['pending', 'error'].includes(f.status))) {
      toast.error("Documentos já foram enviados")
      return
    }
    setIsUploading(true)

    for (const fileIndex in newFiles) {
      const file = newFiles[fileIndex];
      if (['success', 'uploading'].includes(file.status) || !file.send) continue;
      await changeFileStatus(+fileIndex, 'uploading')
      try {
        const { error } = await onImport({
          file: file.file
        });
        if (error) {
          changeFileStatus(+fileIndex, 'error', error)
          continue;
        }
        changeFileStatus(+fileIndex, 'success', undefined)
      } catch (error) {
        changeFileStatus(+fileIndex, 'error', "Erro ao importar documento")
      }
    }
  };

  const resetForm = () => {
    setFiles([])
    setIsUploading(false)
    setSelectFilesDisabled(false)
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getColorByStatus = (status: 'pending' | 'uploading' | 'success' | 'error') => {
    switch (status) {
      case 'pending': return 'text-yellow-500'
      case 'uploading': return 'text-blue-500'
      case 'success': return 'text-green-500'
      case 'error': return 'text-red-500'
    }
  }

  useEffect(() => {
    if (!isUploading) return
    const somePending = files.some(f => ['pending', 'uploading'].includes(f.status) && f.send)
    console.log({ somePending, files })
    if (somePending) return
    setIsUploading(false)

    const allSuccess = files.every(f => f.status === 'success')
    if (!allSuccess) {
      toast.error("Erro ao importar documentos")
      return
    }
    toast.success("Documentos importados com sucesso")
    resetForm();
    onSuccess();
  }, [files])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Importar Documento</DialogTitle>
        </DialogHeader>

        <FileDropzone
          onFileDrop={(receivedFiles) => {
            const filesToAdd: PageFile[] = []
            for (const file of receivedFiles as File[]) {
              const fileSize = file.size / 1024 / 1024
              if (fileSize > 50) {
                filesToAdd.push({ file, size: fileSize, status: 'error', error: "O arquivo deve ter no máximo 50 MB", send: false })
                continue
              }
              filesToAdd.push({ file, size: fileSize, status: 'pending', error: undefined, send: true })
            }
            setFiles([...files, ...filesToAdd])
          }}
          isUploading={isUploading}
          accept=".pdf"
          multiple
          disabled={selectFilesDisabled}
        />
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {files.map((file, index) => (
            <div key={index} className={`text-sm text-gray-500 mt-4 ${getColorByStatus(file.status)}`}>
              <div className="flex flex-row gap-2 items-center justify-between">
                <p>Nome: {file.file.name} - {+file.size.toFixed(2)} MB</p>
                {file.status === 'uploading' && <Loader2 className="animate-spin mx-auto" size={18} />}
                {file.status === 'success' && <Check className="h-4 w-4 text-green-500" />}
                {(['pending', 'error'].includes(file.status) && !isUploading) && (
                  <Button variant="outline" size="icon" onClick={() => {
                    setFiles(files.filter((_, i) => i !== index))
                  }}>
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {file.error && <p className="text-red-500">{file.error}</p>}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="mr-2">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading || files.length === 0}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 