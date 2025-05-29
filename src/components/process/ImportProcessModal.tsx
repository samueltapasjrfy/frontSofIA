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
import { cn } from "@/utils/cn";
import { GetBgColor } from "../layout/GetBgColor";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";

interface RegisterProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: { litigationNumber: string; idInternal?: string }) => Promise<boolean>;
}

export function RegisterProcessModal({ isOpen, onClose, onImport }: RegisterProcessModalProps) {
  const [litigationNumber, setLitigationNumber] = useState("");
  const [idInternal, setIdInternal] = useState("");
  const [errors, setErrors] = useState<{ litigationNumber?: string }>({});
  const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)

  const validateForm = () => {
    const newErrors: { litigationNumber?: string } = {};

    if (!litigationNumber.trim()) {
      newErrors.litigationNumber = "Número do processo é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const success = await onImport({
      litigationNumber,
      idInternal: idInternal || undefined
    });
    if (!success) return;
    resetForm();
  };

  const resetForm = () => {
    setLitigationNumber("");
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
          <DialogTitle className="text-xl font-bold text-gray-800">Registrar Processo</DialogTitle>
          <DialogDescription>
            Preencha os dados do processo.
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
            <label htmlFor="idInternal" className="text-sm font-medium text-gray-700">
              ID do Processo <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <Input
              id="idInternal"
              value={idInternal}
              onChange={(e) => setIdInternal(e.target.value)}
              placeholder="Identificador único do processo (se disponível)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="mr-2">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className={cn(
              "text-white",
              GetBgColor(user?.companies?.[0]?.id, true)
            )}
          >
            <Upload className="h-4 w-4 mr-2" />
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 