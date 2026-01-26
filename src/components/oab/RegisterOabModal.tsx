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
import { Scale, Plus, X, AlertCircle } from "lucide-react";
import { STATES } from "@/constants/states";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OabItem {
  oab: string;
  state: number | null;
  name: string;
}

interface RegisterOabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (oabs: Array<{ oab: string; state: number; name: string }>) => Promise<void>;
}

export function RegisterOabModal({ isOpen, onClose, onSave }: RegisterOabModalProps) {
  const [oabs, setOabs] = useState<OabItem[]>([{ oab: "", state: null, name: "" }]);
  const [errors, setErrors] = useState<Record<number, { oab?: string; state?: string }>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<number, { oab?: string; state?: string }> = {};
    let isValid = true;

    oabs.forEach((oabItem, index) => {
      if (!oabItem.oab.trim()) {
        newErrors[index] = { ...newErrors[index], oab: "Número da OAB é obrigatório" };
        isValid = false;
      }

      if (!oabItem.state) {
        newErrors[index] = { ...newErrors[index], state: "Estado é obrigatório" };
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const validOabs = oabs
        .filter((oab) => oab.oab.trim() && oab.state)
        .map((oab) => ({
          oab: oab.oab.trim(),
          state: oab.state!,
          name: oab.name.trim() || `OAB ${oab.oab}`,
        }));

      await onSave(validOabs);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar OABs:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setOabs([{ oab: "", state: null, name: "" }]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addOabRow = () => {
    setOabs([...oabs, { oab: "", state: null, name: "" }]);
  };

  const removeOabRow = (index: number) => {
    if (oabs.length > 1) {
      const newOabs = oabs.filter((_, i) => i !== index);
      setOabs(newOabs);
      const newErrors = { ...errors };
      delete newErrors[index];
      // Reindexar erros
      const reindexedErrors: Record<number, { oab?: string; state?: string }> = {};
      Object.keys(newErrors).forEach((key) => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexedErrors[oldIndex - 1] = newErrors[oldIndex];
        } else {
          reindexedErrors[oldIndex] = newErrors[oldIndex];
        }
      });
      setErrors(reindexedErrors);
    }
  };

  const updateOab = (index: number, field: keyof OabItem, value: string | number | null) => {
    const newOabs = [...oabs];
    newOabs[index] = { ...newOabs[index], [field]: value };
    setOabs(newOabs);
    // Limpar erro do campo quando atualizado
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index][field as keyof typeof newErrors[number]];
      if (Object.keys(newErrors[index]).length === 0) {
        delete newErrors[index];
      }
      setErrors(newErrors);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50">
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Cadastrar OABs
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Informe uma ou mais OABs para buscar publicações automaticamente
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Labels */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <label className="text-sm font-medium text-gray-700">
              Número da OAB
            </label>
            <label className="text-sm font-medium text-gray-700">
              UF
            </label>
          </div>

          {/* OAB Rows */}
          {oabs.map((oabItem, index) => (
            <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-2 items-start">
              <div className="grid gap-2">
                <Input
                  value={oabItem.oab}
                  onChange={(e) => updateOab(index, "oab", e.target.value)}
                  placeholder="123456"
                  className={errors[index]?.oab ? "border-red-500" : ""}
                />
                {errors[index]?.oab && (
                  <div className="flex items-center text-red-500 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors[index].oab}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Select
                  value={oabItem.state?.toString() || ""}
                  onValueChange={(value) => updateOab(index, "state", parseInt(value))}
                >
                  <SelectTrigger className={errors[index]?.state ? "border-red-500" : ""}>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((state) => (
                      <SelectItem key={state.id} value={state.id.toString()}>
                        {state.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[index]?.state && (
                  <div className="flex items-center text-red-500 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors[index].state}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeOabRow(index)}
                className="h-9 w-9 text-gray-400 hover:text-red-600"
                disabled={oabs.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Add OAB Button */}
          <Button
            variant="outline"
            onClick={addOabRow}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar outra OAB
          </Button>

          {/* Info Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mt-2">
            <p className="text-sm text-gray-600">
              Ao cadastrar, o sistema irá buscar automaticamente todas as publicações relacionadas aos processos de cada OAB e classificá-las com inteligência artificial.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? "Cadastrando..." : "Cadastrar OABs"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
