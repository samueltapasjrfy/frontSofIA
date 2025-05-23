"use client";
import { useState } from "react";
import { queryClient } from "@/lib/reactQuery";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner"
import ModalImportData from "@/components/modalImportData/modalImportData";
import { QUERY_KEYS } from "@/constants/cache";
import { ProcessTable } from "@/components/process/ProcessTable";
import { ImportProcessModal } from "@/components/process/ImportProcessModal";
import { useProcesses } from "@/hooks/useProcess";
import { ProcessApi } from "@/api/processApi";
import { ProcessStats } from "@/components/process/ProcessStats";
import { cn } from "@/utils/cn";
import { GetBgColor } from "@/components/layout/GetBgColor";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";

const litigationColumns = {
  litigation: 'Processo',
  instance: 'Instância',
  idInternal: 'ID',
}

export default function ProcessesPage() {
  const [isModalImportDataOpen, setIsModalImportDataOpen] = useState(false);
  const { invalidateProcessesQuery, invalidateReport, saveProcesses } = useProcesses();
  const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)

  const onRefresh = async () => {
    invalidateProcessesQuery();
    invalidateReport();
    await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.PROCESS] });
    await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.PROCESSES] });
    await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.REPORT] });
  }

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
  };

  const handleFinishImport = async (
    rows: Array<{ [k: string]: string }>,
    expectedColumnsToRows: { [k: string]: string },
  ): Promise<boolean> => {
    const params: ProcessApi.Save.Params = {
      processes: rows.map((row: { [k: string]: string }) => ({
        cnj: row[expectedColumnsToRows[litigationColumns.litigation]],
        instance: +row[expectedColumnsToRows[litigationColumns.instance]] || undefined,
        metadata: {
          idInternal: row[expectedColumnsToRows[litigationColumns.idInternal]],
        },
      })),
      monitoring: true,
      registration: true,
    };
    const response = await ProcessApi.save(params);
    if (response.error) {
      toast.error(response.message || "Erro ao importar publicações");
      return false;
    }
    toast.success("Processos enviados para a fila de importação");
    setIsModalImportDataOpen(false);
    setTimeout(onRefresh, 1000);
    return true;
  };

  const handleSaveProtocol = async (data: { litigationNumber: string; instance?: number; idInternal?: string }): Promise<boolean> => {
    const response = await saveProcesses({
      processes: [{
        cnj: data.litigationNumber,
        instance: data.instance,
        metadata: {
          idInternal: data.idInternal,
        },
      }],
      monitoring: true,
      registration: true,
    });
    if (response.error) {
      toast.error(response.message || "Erro ao registrar processo");
      return false;
    }
    toast.success("Processo registrado com sucesso");
    setIsImportModalOpen(false);
    return true;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Processos</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsModalImportDataOpen(true)}
            className="bg-primary-white hover:bg-primary-white text-primary-blue border border-primary-blue"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar Processos
          </Button>
          <Button
            onClick={handleOpenImportModal}
            className={cn(
              "text-white",
              GetBgColor(user?.companies?.[0]?.id, true)
            )}
          >
            <Upload className="h-4 w-4 mr-2" />
            Registrar Processo
          </Button>
        </div>
      </div>

      <ProcessStats />

      <ProcessTable
        onRefresh={onRefresh}
      />

      <ImportProcessModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        onImport={handleSaveProtocol}
      />

      <ModalImportData
        isModalOpen={isModalImportDataOpen}
        setIsModalOpen={setIsModalImportDataOpen}
        title="Importar Processos"
        finish={handleFinishImport}
        docExampleUrl={``}
        expectedColumns={[
          {
            key: litigationColumns.litigation,
            example: '0001234-56.2024.8.26.0001',
            previewWidth: 200,
            variant: ['NÚMERO DO PROCESSO', 'PROCESSO', 'LITIGATION', 'NUMBER'],
          },
          {
            key: litigationColumns.instance,
            example: '1',
            previewWidth: 200,
            variant: ['INSTÂNCIA', 'INSTANCE', 'INSTANCE NUMBER'],
          },
          {
            key: litigationColumns.idInternal,
            example: '1234567890',
            previewWidth: 200,
            variant: ['ID INTERNO', 'ID DA PUBLICAÇÃO'],
          }
        ]}
      />
    </div>
  );
} 