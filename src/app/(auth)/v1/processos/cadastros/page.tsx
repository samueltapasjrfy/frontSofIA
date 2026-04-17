"use client";
import { useState } from "react";
import { toast } from "sonner"
import ModalImportData from "@/components/modalImportData/modalImportData";
import { ProcessTable } from "@/components/process/ProcessTable";
import { ImportProcessData, ImportProcessOptions, RegisterProcessModal } from "@/components/process/ImportProcessModal";
import { useProcesses } from "@/hooks/useProcess";
import { ProcessApi } from "@/api/processApi";
import { ProcessStats } from "@/components/process/ProcessStats";
import { HandleEntitiesButtons } from "@/components/handleEntitiesButtons";
import { cn } from "@/utils/cn";
import { Check, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type SaveProcessParams = ProcessApi.Save.Params & {
  registrationParts?: boolean;
};

function AcoesStepContent({
  buscarDadosProcessos,
  setBuscarDadosProcessos,
  monitorarProcessos,
  setMonitorarProcessos,
  monitorarPartes,
  setMonitorarPartes,
  verificarHabilitacao,
  setVerificarHabilitacao,
  onContinue,
}: {
  buscarDadosProcessos: boolean;
  setBuscarDadosProcessos: (v: boolean) => void;
  monitorarProcessos: boolean;
  setMonitorarProcessos: (v: boolean) => void;
  monitorarPartes: boolean;
  setMonitorarPartes: (v: boolean) => void;
  verificarHabilitacao: boolean;
  setVerificarHabilitacao: (v: boolean) => void;
  onContinue: () => void;
}) {
  const canContinue =
    buscarDadosProcessos ||
    monitorarProcessos ||
    monitorarPartes ||
    verificarHabilitacao;
  return (
    <div className="space-y-6">
      <div className="flex w-full">
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={buscarDadosProcessos}
              onCheckedChange={(v) => setBuscarDadosProcessos(v === true)}
            />
            <span>Buscar dados dos processos</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={monitorarProcessos}
              onCheckedChange={(v) => setMonitorarProcessos(v === true)}
            />
            <span>Monitorar Processos</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={monitorarPartes}
              onCheckedChange={(v) => setMonitorarPartes(v === true)}
            />
            <span>Monitorar Partes</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={verificarHabilitacao}
              onCheckedChange={(v) => setVerificarHabilitacao(v === true)}
            />
            <span>Verificar habilitação</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <Button
          variant="default"
          onClick={onContinue}
          disabled={!canContinue}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}

const litigationColumns = {
  litigation: 'Processo',
  instance: 'Instância',
  idInternal: 'ID',
  clientCode: 'Código Cliente',
  controlClient: 'Controle Cliente',
  clientName: 'Cliente',
  advLiderResponsavel: 'Líder | Advogado',
  nucleo: 'Núcleo',
  dataTerceirizacao: 'Data de Terceirização',
  clienteAutorOuReu: 'Cliente Autor ou Reu',
}

const metadataColumns = [{
  key: litigationColumns.clientCode,
  example: '12345',
  previewWidth: 200,
  variant: ['CÓDIGO CLIENTE', 'CODIGO CLIENTE', 'CÓD_CLIENTE', 'COD_CLIENTE', 'CLIENT CODE'],
},
{
  key: litigationColumns.controlClient,
  example: '1234567890',
  previewWidth: 200,
  variant: ['CONTROLE CLIENTE', 'CONTROL CLIENT'],
},
{
  key: litigationColumns.clientName,
  example: 'Cliente 1',
  previewWidth: 200,
  variant: ['CLIENTE', 'CLIENT'],
},
{
  key: litigationColumns.advLiderResponsavel,
  example: 'Líder 1',
  previewWidth: 200,
  variant: ['LÍDER', 'LEADER', 'ADVOGADO', 'RESPONSÁVEL'],
},
{
  key: litigationColumns.nucleo,
  example: 'Núcleo 1',
  previewWidth: 200,
  variant: ['NÚCLEO', 'NUCLEUS'],
},
{
  key: litigationColumns.dataTerceirizacao,
  example: '01/01/2025',
  previewWidth: 200,
  variant: ['DATA DE TERCEIRIZAÇÃO', 'TERCEIRIZATION DATE', 'DATA'],
},
{
  key: litigationColumns.clienteAutorOuReu,
  example: 'Réu',
  previewWidth: 200,
  variant: ['CLIENTE AUTOR OU REU', 'AUTHOR OR DEFENDANT', 'AUTOR OU REU'],
}]

export default function ProcessesPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isRemoveMonitoringModalOpen, setIsRemoveMonitoringModalOpen] = useState(false);
  const [isUpdateStatusBulkModalOpen, setIsUpdateStatusBulkModalOpen] = useState(false);
  const [buscarDadosProcessos, setBuscarDadosProcessos] = useState(false);
  const [monitorarProcessos, setMonitorarProcessos] = useState(false);
  const [monitorarPartes, setMonitorarPartes] = useState(false);
  const [verificarHabilitacao, setVerificarHabilitacao] = useState(false);
  const { invalidateProcessesQuery, invalidateReport, saveProcesses } = useProcesses();

  const onRefresh = async () => {
    invalidateProcessesQuery();
    invalidateReport();
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

  const handleOpenUpdateStatusBulkModal = () => {
    setIsUpdateStatusBulkModalOpen(true);
  };

  const handleFinishImport = async (
    rows: Array<{ [k: string]: string }>,
    expectedColumnsToRows: { [k: string]: string },
  ): Promise<boolean> => {
    const params: SaveProcessParams = {
      processes: rows.map((row: { [k: string]: string }) => ({
        cnj: row[expectedColumnsToRows[litigationColumns.litigation]],
        metadata: {
          idInternal: row[expectedColumnsToRows[litigationColumns.idInternal]] || undefined,
          codigoCliente: row[expectedColumnsToRows[litigationColumns.clientCode]] || undefined,
          controleCliente: row[expectedColumnsToRows[litigationColumns.controlClient]] || undefined,
          cliente: row[expectedColumnsToRows[litigationColumns.clientName]] || undefined,
          advLiderResponsavel: row[expectedColumnsToRows[litigationColumns.advLiderResponsavel]] || undefined,
          nucleo: row[expectedColumnsToRows[litigationColumns.nucleo]] || undefined,
          dataTerceirizacao: row[expectedColumnsToRows[litigationColumns.dataTerceirizacao]] || undefined,
          clienteAutorOuReu: row[expectedColumnsToRows[litigationColumns.clienteAutorOuReu]] || undefined,
        },
      })),
      monitoring: monitorarProcessos,
      registration: buscarDadosProcessos,
      monitoringParts: monitorarPartes,
      registrationParts: verificarHabilitacao,
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

  const handleSaveProtocol = async (data: ImportProcessData, options: ImportProcessOptions): Promise<boolean> => {
    const params: SaveProcessParams = {
      processes: [{
        cnj: data.litigationNumber,
        metadata: {
          idInternal: data.idInternal,
          codigoCliente: data.clientCode,
          controleCliente: data.controlClient,
          cliente: data.clientName,
          advLiderResponsavel: data.advLiderResponsavel,
          nucleo: data.nucleo,
          dataTerceirizacao: data.dataTerceirizacao,
          clienteAutorOuReu: data.clienteAutorOuReu,
        },
      }],
      monitoring: options.monitoring,
      registration: options.registration,
      monitoringParts: options.monitoringParts,
      registrationParts: options.registrationParts,
    };
    const response = await saveProcesses(params);
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

  const handleFinishUpdateStatusBulk = async (
    rows: Array<{ [k: string]: string }>,
    expectedColumnsToRows: { [k: string]: string },
  ): Promise<boolean> => {
    const params: ProcessApi.SetImported.Params = {
      cnjs: rows.map((row: { [k: string]: string }) => row[expectedColumnsToRows[litigationColumns.litigation]]),
      ids: [],
    };
    const response = await ProcessApi.setImported(params);
    if (response.error) {
      toast.error(response.message || "Erro ao atualizar status");
      return false;
    }
    toast.success("Status atualizado com sucesso");
    setIsUpdateStatusBulkModalOpen(false);
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
                onClick={handleOpenRemoveModal}
                variant="outline"
                className={cn(
                  "text-red-500 hover:text-white hover:bg-red-500 border-red-500",
                )}
              >
                <Trash className="h-4 w-4 mr-2" />
                Remover Monitoramento
              </Button>
              <Button
                onClick={handleOpenUpdateStatusBulkModal}
                variant="outline"
                className="bg-primary-white hover:bg-primary-white text-primary-blue border border-primary-blue"
              >
                <Check className="h-4 w-4 mr-2" />
                Atualizar Status para Importado
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
        firstStep={{
          label: "Ações",
          render: ({ onContinue }) => (
            <AcoesStepContent
              buscarDadosProcessos={buscarDadosProcessos}
              setBuscarDadosProcessos={setBuscarDadosProcessos}
              monitorarProcessos={monitorarProcessos}
              setMonitorarProcessos={setMonitorarProcessos}
              monitorarPartes={monitorarPartes}
              setMonitorarPartes={setMonitorarPartes}
              verificarHabilitacao={verificarHabilitacao}
              setVerificarHabilitacao={setVerificarHabilitacao}
              onContinue={onContinue}
            />
          ),
        }}
        docExampleUrl={`${process.env.NEXT_PUBLIC_FILES}/exemplos/importar_processos_exemplo.xlsx`}
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
          },
          ...metadataColumns,
        ]}
      />
      <ModalImportData
        isModalOpen={isUpdateStatusBulkModalOpen}
        setIsModalOpen={setIsUpdateStatusBulkModalOpen}
        title="Atualizar Status para Importado"
        finish={handleFinishUpdateStatusBulk}
        docExampleUrl={`${process.env.NEXT_PUBLIC_FILES}/exemplos/atualizar_status_exemplo.xlsx`}
        expectedColumns={[
          {
            key: litigationColumns.litigation,
            example: '0001234-56.2024.8.26.0001',
            previewWidth: 200,
            variant: ['NÚMERO DO PROCESSO', 'PROCESSO', 'LITIGATION', 'NUMBER'],
          },
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