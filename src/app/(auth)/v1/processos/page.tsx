"use client";
import { useState } from "react";
import { queryClient } from "@/lib/reactQuery";
import { toast } from "sonner"
import ModalImportData from "@/components/modalImportData/modalImportData";
import { QUERY_KEYS } from "@/constants/cache";
import { ProcessTable } from "@/components/process/ProcessTable";
import { RegisterProcessModal } from "@/components/process/ImportProcessModal";
import { useProcesses } from "@/hooks/useProcess";
import { ProcessApi } from "@/api/processApi";
import { ProcessStats } from "@/components/process/ProcessStats";
import { HandleEntitiesButtons } from "@/components/handleEntitiesButtons";
import { cn } from "@/utils/cn";
import { Check, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

const litigationColumns = {
  litigation: 'Processo',
  instance: 'Instância',
  idInternal: 'ID',
}

export default function ProcessesPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isRemoveMonitoringModalOpen, setIsRemoveMonitoringModalOpen] = useState(false);
  const [isActivateMonitoringBulkModalOpen, setIsActivateMonitoringBulkModalOpen] = useState(false);
  const { invalidateProcessesQuery, invalidateReport, saveProcesses } = useProcesses();

  const onRefresh = async () => {
    invalidateProcessesQuery();
    invalidateReport();
    await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.PROCESS] });
    await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.PROCESSES] });
    await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.REPORT] });
  }


  const handleOpenRegisterModal = () => {
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };

  const handleOpenRemoveModal = () => {
    setIsRemoveMonitoringModalOpen(true);
  };

  const handleOpenActivateMonitoringBulkModal = () => {
    setIsActivateMonitoringBulkModalOpen(true);
  };

  const handleFinishImport = async (
    rows: Array<{ [k: string]: string }>,
    expectedColumnsToRows: { [k: string]: string },
  ): Promise<boolean> => {
    const params: ProcessApi.Save.Params = {
      processes: rows.map((row: { [k: string]: string }) => ({
        cnj: row[expectedColumnsToRows[litigationColumns.litigation]],
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
    setIsImportModalOpen(false);
    setTimeout(onRefresh, 1000);
    return true;
  };

  const handleFinishActivateMonitoringBulk = async (
    rows: Array<{ [k: string]: string }>,
    expectedColumnsToRows: { [k: string]: string },
  ): Promise<boolean> => {
    const params: ProcessApi.Save.Params = {
      processes: rows.map((row: { [k: string]: string }) => ({
        cnj: row[expectedColumnsToRows[litigationColumns.litigation]],
      })),
      monitoring: true,
      registration: false,
    };
    const response = await ProcessApi.save(params);
    if (response.error) {
      toast.error(response.message || "Erro ao ativar monitoramento");
      return false;
    }
    toast.success("Monitoramento ativado com sucesso");
    setIsImportModalOpen(false);
    setTimeout(onRefresh, 1000);
    return true;
  };

  const handleSaveProtocol = async (data: { litigationNumber: string; instance?: number; idInternal?: string }): Promise<boolean> => {
    const response = await saveProcesses({
      processes: [{
        cnj: data.litigationNumber,
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
    setIsRegisterModalOpen(false);
    return true;
  };

  const handleRemoveMonitoring = async (
    rows: Array<{ [k: string]: string }>,
    expectedColumnsToRows: { [k: string]: string },
  ): Promise<boolean> => {
    const params: ProcessApi.DeactivateMonitoringBulk.Params = {
      cnjs: rows.map((row: { [k: string]: string }) => row[expectedColumnsToRows[litigationColumns.litigation]])
    };
    const response = await ProcessApi.deactivateMonitoringBulk(params);
    if (response.error) {
      toast.error(response.message || "Erro ao desativar monitoramento");
      return false;
    }
    toast.success("Monitoramento desativado com sucesso");
    setIsRemoveMonitoringModalOpen(false);
    setTimeout(onRefresh, 1000);
    return true;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Processos</h1>
        <HandleEntitiesButtons
          entityName="Processos"
          handleImport={handleOpenImportModal}
          handleRegister={handleOpenRegisterModal}
          otherButtons={
            <>
              <Button
                onClick={handleOpenActivateMonitoringBulkModal}
                variant="outline"
                className="bg-primary-white hover:bg-primary-white text-primary-blue border border-primary-blue"
              >
                <Check className="h-4 w-4 mr-2" />
                Ativar Monitoramento
              </Button>
              <Button
                onClick={handleOpenRemoveModal}
                variant="outline"
                className={cn(
                  "text-red-500 hover:text-white hover:bg-red-500 border-red-500",
                )}
              >
                <Trash className="h-4 w-4 mr-2" />
                Remover Monitoramento
              </Button>
            </>
          }
        />
      </div>

      <ProcessStats />

      <ProcessTable
        onRefresh={onRefresh}
      />

      <RegisterProcessModal
        isOpen={isRegisterModalOpen}
        onClose={handleCloseRegisterModal}
        onImport={handleSaveProtocol}
      />

      <ModalImportData
        isModalOpen={isImportModalOpen}
        setIsModalOpen={setIsImportModalOpen}
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
            key: litigationColumns.idInternal,
            example: '1234567890',
            previewWidth: 200,
            variant: ['ID INTERNO', 'ID DA PUBLICAÇÃO'],
          }
        ]}
      />
      <ModalImportData
        isModalOpen={isActivateMonitoringBulkModalOpen}
        setIsModalOpen={setIsActivateMonitoringBulkModalOpen}
        title="Ativar Monitoramento"
        finish={handleFinishActivateMonitoringBulk}
        docExampleUrl={``}
        expectedColumns={[
          {
            key: litigationColumns.litigation,
            example: '0001234-56.2024.8.26.0001',
            previewWidth: 200,
            variant: ['NÚMERO DO PROCESSO', 'PROCESSO', 'LITIGATION', 'NUMBER'],
          }
        ]}
      />
      <ModalImportData
        isModalOpen={isRemoveMonitoringModalOpen}
        setIsModalOpen={setIsRemoveMonitoringModalOpen}
        title="Remover Monitoramento"
        finish={handleRemoveMonitoring}
        docExampleUrl={``}
        expectedColumns={[
          {
            key: litigationColumns.litigation,
            example: '0001234-56.2024.8.26.0001',
            previewWidth: 200,
            variant: ['NÚMERO DO PROCESSO', 'PROCESSO', 'LITIGATION', 'NUMBER'],
          }
        ]}
      />
    </div>
  );
} 