"use client";
import { useState } from "react";
import { queryClient } from "@/lib/reactQuery";
import { QUERY_KEYS } from "@/constants/cache";
import { DocumentTable } from "./components/DocumentTable";
import { ImportDocumentModal } from "./components/ImportDocumentModal";
import { HandleEntitiesButtons } from "@/components/handleEntitiesButtons";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentApi } from "@/api/documentApi";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";

export default function DocumentsPage() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const { invalidateDocumentsQuery } = useDocuments()
  const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)
  // const { invalidateProcessesQuery, invalidateReport, saveProcesses } = useProcesses();

  const onRefresh = async () => {
    // invalidateProcessesQuery();
    // invalidateReport();
    await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
  }

  const handleImportDocument = async (data: { file: File }): Promise<{ error?: string }> => {
    const response = await DocumentApi.analyzeDocument({ file: data.file, idCompany: user?.companies?.[0]?.id || '' })
    if (response.error) {
      return { error: response.message }
    }
    return { error: undefined }
  }

  return (
    <div className="p-6 space-y-6 bg-primary-gray-light">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sentius</h1>
        <HandleEntitiesButtons
          entityName="Sentenças"
          handleRegister={() => { setIsRegisterModalOpen(true) }}
        />
      </div>
      {/* <ProcessStats />

     */}

      <DocumentTable
        onRefresh={onRefresh}
      />

      <ImportDocumentModal
        isOpen={isRegisterModalOpen}
        onClose={() => { setIsRegisterModalOpen(false) }}
        onImport={handleImportDocument}
        onSuccess={() => {
          setIsRegisterModalOpen(false)
          setTimeout(() => {
            invalidateDocumentsQuery()
          }, 2000)
        }}
      />
    </div>
  );
} 