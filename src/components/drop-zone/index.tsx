import { Inbox, Loader2 } from "lucide-react";
import { useState } from "react";

interface FileDropzoneProps {
    onFileDrop: (file: File) => void;
    isUploading: boolean;
}

const FileDropzone = ({ onFileDrop, isUploading }: FileDropzoneProps) => {
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
            onFileDrop(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileDrop(e.target.files[0]);
        }
    };

    return (
        <div
            className={`border-2 border-dashed p-6 text-center cursor-pointer ${dragActive ? 'bg-gray-100' : ''
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-input"
            />
            <label htmlFor="file-upload-input" className="cursor-pointer">
                {isUploading ? (
                    <Loader2 className="animate-spin mx-auto" size={24} />
                ) : (
                    <Inbox className="mx-auto" size={24} />
                )}
                <p className="mt-2">
                    Clique ou arraste o arquivo para esta área para enviar o arquivo
                </p>
                <p className="text-sm text-gray-500">.xlsx, .xls ou .csv</p>
            </label>
        </div>
    );
};

export default FileDropzone;