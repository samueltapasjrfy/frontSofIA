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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

interface ReclassifyPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedOption: string) => Promise<void>;
  options: { value: string; label: string }[];
}

export function ReclassifyPublicationModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  options 
}: ReclassifyPublicationModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedOption) {
      setError("Por favor, selecione uma opção");
      return;
    }
    
    setLoading(true);
    try {
      await onConfirm(selectedOption);
      handleClose();
    } catch (error) {
      setError("Erro ao processar a solicitação");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedOption("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Reclassificar Publicação</DialogTitle>
          <DialogDescription>
            Selecione a nova classificação para esta publicação.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Select
              value={selectedOption}
              onValueChange={setSelectedOption}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="mr-2">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-primary-blue hover:bg-blue-700 text-white"
          >
            {loading ? "Processando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 