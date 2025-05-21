"use client";
import { useState } from "react";
import { PublicationStats } from "@/components/pages/publications/PublicationStats";
import { PublicationsTable } from "@/components/pages/publications/PublicationsTable";
import { RegisterPublicationModal } from "@/components/pages/publications/RegisterPublicationModal";
import ModalImportData from "@/components/modalImportData/modalImportData";
import { RegisterButtons } from "@/components/registerButtons";
import { PublicationHandle } from "./publicationHandle";
import { importPublicationsExpectedColumns } from "./constants";
import { RegisterPublication } from "@/components/pages/publications/types";
import { ImportData } from "@/components/modalImportData/types";

export default function PublicationsPage() {
  const [isModalImportDataOpen, setIsModalImportDataOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const {
    discardPublication,
    confirmPublication,
    handleFinishImport,
    handleRegisterPublication,
    onRefresh
  } = PublicationHandle();

  const handleRegister = async (data: RegisterPublication) => {
    const success = await handleRegisterPublication(data);
    if (success) setIsImportModalOpen(false);
    return success;
  }

  const handleImport = async (data: ImportData) => {
    const success = await handleFinishImport(data);
    if (success) setIsModalImportDataOpen(false);
    return success;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Publicações</h1>
        <RegisterButtons
          handleImportClick={async () => setIsModalImportDataOpen(true)}
          handleRegisterClick={() => setIsImportModalOpen(true)}
          labelImport="Importar Publicações"
          labelRegister="Registrar Publicação"
        />
      </div>

      <PublicationStats />

      <PublicationsTable
        onConfirm={confirmPublication}
        onDiscard={discardPublication}
        onRefresh={onRefresh}
      />

      <RegisterPublicationModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onRegister={handleRegister}
      />

      <ModalImportData
        isModalOpen={isModalImportDataOpen}
        setIsModalOpen={setIsModalImportDataOpen}
        title="Importar Publicações"
        finish={handleImport}
        docExampleUrl={``}
        expectedColumns={importPublicationsExpectedColumns}
      />
    </div>
  );
} 