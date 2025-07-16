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

export type ImportProcessData = {
  litigationNumber: string;
  idInternal?: string;
  controlClient?: string;
  clientName?: string;
  advLiderResponsavel?: string;
  nucleo?: string;
  dataTerceirizacao?: string;
  clienteAutorOuReu?: string;
}

interface RegisterProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ImportProcessData) => Promise<boolean>;
}

export function RegisterProcessModal({ isOpen, onClose, onImport }: RegisterProcessModalProps) {
  const [litigationNumber, setLitigationNumber] = useState("");
  const [idInternal, setIdInternal] = useState("");
  const [controlClient, setControlClient] = useState("");
  const [clientName, setClientName] = useState("");
  const [advLiderResponsavel, setAdvLiderResponsavel] = useState("");
  const [nucleo, setNucleo] = useState("");
  const [dataTerceirizacao, setDataTerceirizacao] = useState("");
  const [clienteAutorOuReu, setClienteAutorOuReu] = useState("");
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
      idInternal: idInternal || undefined,
      controlClient: controlClient || undefined,
      clientName: clientName || undefined,
      advLiderResponsavel: advLiderResponsavel || undefined,
      nucleo: nucleo || undefined,
      dataTerceirizacao: dataTerceirizacao || undefined,
      clienteAutorOuReu: clienteAutorOuReu || undefined
    });
    if (!success) return;
    resetForm();
  };

  const resetForm = () => {
    setLitigationNumber("");
    setIdInternal("");
    setControlClient("");
    setClientName("");
    setAdvLiderResponsavel("");
    setNucleo("");
    setDataTerceirizacao("");
    setClienteAutorOuReu("");
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
            <div>
              <label htmlFor="idInternal" className="text-sm font-medium text-gray-700">
                ID do Processo
              </label>
              <Input
                id="idInternal"
                value={idInternal}
                onChange={(e) => setIdInternal(e.target.value)}
                placeholder="Identificador único do processo (se disponível)"
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-1 md:grid-cols-2">
            <div>
              <label htmlFor="controlClient" className="text-sm font-medium text-gray-700">
                Controle Cliente
              </label>
              <Input
                id="controlClient"
                value={controlClient}
                onChange={(e) => setControlClient(e.target.value)}
                placeholder="Identificador do cliente"
              />
            </div>
            <div>
              <label htmlFor="clientName" className="text-sm font-medium text-gray-700">
                Cliente
              </label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label htmlFor="advLiderResponsavel" className="text-sm font-medium text-gray-700">
                Adv | Líder responsável
              </label>
              <Input
                id="advLiderResponsavel"
                value={advLiderResponsavel}
                onChange={(e) => setAdvLiderResponsavel(e.target.value)}
                placeholder="Nome do líder | advogado"
              />
            </div>
            <div>
              <label htmlFor="nucleo" className="text-sm font-medium text-gray-700">
                Núcleo
              </label>
              <Input
                id="nucleo"
                value={nucleo}
                onChange={(e) => setNucleo(e.target.value)}
                placeholder="Nome do núcleo"
              />
            </div>
            <div>
              <label htmlFor="dataTerceirizacao" className="text-sm font-medium text-gray-700">
                Data da Terceirização
              </label>
              <Input
                id="dataTerceirizacao"
                type="date"
                value={dataTerceirizacao}
                onChange={(e) => setDataTerceirizacao(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="clienteAutorOuReu" className="text-sm font-medium text-gray-700">
                Cliente Autor ou Réu
              </label>
              <select
                id="clienteAutorOuReu"
                value={clienteAutorOuReu}
                onChange={(e) => setClienteAutorOuReu(e.target.value)}
                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione</option>
                <option value="Autor">Autor</option>
                <option value="Reu">Reu</option>
              </select>
            </div>
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