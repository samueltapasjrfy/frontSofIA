"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, AlertCircle } from "lucide-react";
import { RegisterPublication } from "./types";

interface RegisterPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: RegisterPublication) => Promise<boolean>;
}

export function RegisterPublicationModal({ isOpen, onClose, onRegister }: RegisterPublicationModalProps) {
  const [litigationNumber, setLitigationNumber] = useState("");
  const [text, setText] = useState("");
  const [idInternal, setIdInternal] = useState("");
  const [errors, setErrors] = useState<{ litigationNumber?: string; text?: string }>({});

  const validateForm = () => {
    const newErrors: { litigationNumber?: string; text?: string } = {};

    if (!litigationNumber.trim()) {
      newErrors.litigationNumber = "Número do processo é obrigatório";
    }

    if (!text.trim()) {
      newErrors.text = "Texto da publicação é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const success = await onRegister({
      litigationNumber,
      text,
      idInternal: idInternal || undefined
    });
    if (!success) return;
    resetForm();
  };

  const resetForm = () => {
    setLitigationNumber("");
    setText("");
    setIdInternal("");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Importar Publicação</DialogTitle>
          <DialogDescription>
            Preencha os dados da publicação para processamento pela I.A. Sofia.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="processNumber" className="text-sm font-medium text-gray-700">
              Número do Processo <span className="text-red-500">*</span>
            </label>
            <Input
              id="litigationNumber"
              value={litigationNumber}
              onChange={(e) => setLitigationNumber(e.target.value)}
              placeholder="0000000-00.0000.0.00.0000"
              className={errors.litigationNumber ? "border-red-500" : ""}
            />
            {errors.litigationNumber && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.litigationNumber}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="text" className="text-sm font-medium text-gray-700">
              Texto da Publicação <span className="text-red-500">*</span>
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Insira o texto completo da publicação..."
              rows={5}
              className={`min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.text ? "border-red-500" : ""
                }`}
            />
            {errors.text && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.text}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="idInternal" className="text-sm font-medium text-gray-700">
              ID da Publicação <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <Input
              id="idInternal"
              value={idInternal}
              onChange={(e) => setIdInternal(e.target.value)}
              placeholder="Identificador único da publicação (se disponível)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="mr-2">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary-blue hover:bg-blue-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 