import { Inbox, Loader2 } from "lucide-react";
import { useState } from "react";

interface FileDropzoneProps {
    onFileDrop: (file: File | File[]) => void;
    isUploading: boolean;
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
}

const FileDropzone = ({ onFileDrop, isUploading, accept, multiple, disabled }: FileDropzoneProps) => {
    const [dragActive, setDragActive] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if (multiple) {
                onFileDrop(Array.from(e.dataTransfer.files));
            } else {
                onFileDrop(e.dataTransfer.files[0]);
            }
            e.dataTransfer.clearData();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (multiple) {
                onFileDrop(Array.from(e.target.files));
            } else {
                onFileDrop(e.target.files[0]);
            }
        }
    };

    return (
        <div
            className={disabled ? 'border-2 border-dashed p-6 text-center cursor-not-allowed opacity-50' : `border-2 border-dashed p-6 text-center cursor-pointer ${dragActive ? 'bg-gray-100' : ''
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept={accept || ".pdf"}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-input"
                multiple={multiple}
                disabled={disabled}
            />
            <label htmlFor="file-upload-input" className={disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}>
                {isUploading ? (
                    <Loader2 className="animate-spin mx-auto" size={24} />
                ) : (
                    <Inbox className="mx-auto" size={24} />
                )}
                <p className="mt-2">
                    Clique ou arraste {multiple ? "os arquivos" : "o arquivo"} para esta área
                </p>
                <p className="text-sm text-gray-500">{accept || ".pdf"}</p>
            </label>
        </div>
    );
};

export default FileDropzone;