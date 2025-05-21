"use client";
import { useState } from "react";
import ModalImportData from "@/components/modalImportData/modalImportData";
import { ProcessTable } from "@/components/pages/process/ProcessTable";
import { ImportProcessModal } from "@/components/pages/process/ImportProcessModal";
import { ProcessStats } from "@/components/pages/process/ProcessStats";
import { RegisterButtons } from "@/components/registerButtons";
import { importProcessesExpectedColumns } from "./constants";
import { ProcessHandle } from "./processHandle";

export default function ProcessesPage() {
  const [isModalImportDataOpen, setIsModalImportDataOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const { handleFinishImport, handleSaveProtocol, onRefresh } = ProcessHandle();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Processos</h1>
        <RegisterButtons
          handleImportClick={async () => setIsModalImportDataOpen(true)}
          handleRegisterClick={() => setIsImportModalOpen(true)}
          labelImport="Importar Processos"
          labelRegister="Registrar Processo"
        />
      </div>

      <ProcessStats />

      <ProcessTable
        onRefresh={onRefresh}
      />

      <ImportProcessModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async (data) => {
          const success = await handleSaveProtocol(data);
          if (success) setIsImportModalOpen(false);
          return success;
        }}
      />

      <ModalImportData
        isModalOpen={isModalImportDataOpen}
        setIsModalOpen={setIsModalImportDataOpen}
        title="Importar Processos"
        finish={async (data) => {
          const success = await handleFinishImport(data);
          if (success) setIsModalImportDataOpen(false);
          return success;
        }}
        docExampleUrl={``}
        expectedColumns={importProcessesExpectedColumns}
      />
    </div>
  );
} 