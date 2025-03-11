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
  const [selectedOption, setSelectedOption] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedOption) {
      setError("Por favor, selecione uma opção");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onConfirm(selectedOption);
      handleClose();
    } catch (error) {
      setError("Ocorreu um erro ao reclassificar a publicação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedOption("");
    setError("");
    onClose();
  };

  // Find the label for the selected option
  const selectedLabel = options.find(opt => opt.value === selectedOption)?.label || "";
  // Truncate the label if it's too long
  const displayLabel = selectedLabel.length > 100 ? selectedLabel.substring(0, 100) + "..." : selectedLabel;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Reclassificar Publicação</DialogTitle>
          <DialogDescription>
            Selecione a nova classificação para esta publicação.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2 w-full">
            <div className="relative w-full">
              <Select
                value={selectedOption}
                onValueChange={setSelectedOption}
              >
                <SelectTrigger className="w-full">
                  <SelectValue 
                    placeholder="Selecione uma opção"
                    className="truncate"
                  >
                    {selectedOption ? displayLabel : "Selecione uma opção"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent 
                  position="popper" 
                  className="w-[var(--radix-select-trigger-width)] z-50" 
                  sideOffset={5}
                >
                  {options.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="truncate"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Confirmando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 