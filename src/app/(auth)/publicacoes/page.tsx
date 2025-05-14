"use client";
import { useState } from "react";
import { queryClient } from "@/lib/reactQuery";
import { PublicationStats } from "@/components/publications/PublicationStats";
import { PublicationsTable } from "@/components/publications/PublicationsTable";
import { ImportPublicationModal } from "@/components/publications/ImportPublicationModal";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { PublicationsApi } from "@/api/publicationsApi";
import { toast } from "sonner"
import ModalImportData from "@/components/modalImportData/modalImportData";
import { usePublications } from "@/hooks/usePublications";
import { QUERY_KEYS } from "@/constants/cache";
import { usePublicationStats } from "@/hooks/usePublicationStats";
import { useReport } from "@/hooks/useReport";

const litigationColumns = {
  litigation: 'Processo',
  text: 'Texto',
  idInternal: 'ID',
}

export default function PublicationsPage() {
  const [isModalImportDataOpen, setIsModalImportDataOpen] = useState(false);
  const { invalidateQuery: invalidatePublications } = usePublications();
  const { invalidateQuery: invalidatePublicationStats } = usePublicationStats();
  const { refreshReport } = useReport();

  const onRefresh = async () => {
    invalidatePublications();
    invalidatePublicationStats();
    refreshReport();
    await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.PUBLICATIONS] });
    await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.PUBLICATION_STATS] });
  }

  const discardPublication = async (id: string) => {
    try {
      await PublicationsApi.delete(id);
      toast.success("Publicação descartada com sucesso");
      onRefresh()
    } catch (error) {
      console.error(error);
      toast.error("Erro ao descartar publicação");
    }
  };

  const confirmPublication = async (publication: PublicationsApi.FindAll.Publication) => {
    try {
      if (!publication?.classifications?.[0]) {
        toast.error("Publicação não possui classificação para aprovar");
        return;
      }

      await PublicationsApi.approveClassification({
        idPublication: publication.id,
        idClassification: publication.classifications[0].id
      });

      toast.success("Classificação aprovada com sucesso");
      invalidatePublications();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao aprovar classificação");
    }
  };

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
    const params: PublicationsApi.SaveBulk.Params = rows.map((row: { [k: string]: string }) => ({
      litigationNumber: row[expectedColumnsToRows[litigationColumns.litigation]],
      text: row[expectedColumnsToRows[litigationColumns.text]],
      idInternal: row[expectedColumnsToRows[litigationColumns.idInternal]],
    }));
    const response = await PublicationsApi.saveBulk(params);
    if (response.error) {
      toast.error(response.message || "Erro ao importar publicações");
      return false;
    }
    toast.success("Publicações importadas com sucesso");
    setIsModalImportDataOpen(false);
    setTimeout(onRefresh, 1000);
    return true;
  };

  const handleImportPublication = async (data: { litigationNumber: string; text: string; idInternal?: string }): Promise<boolean> => {
    const response = await PublicationsApi.save({
      litigationNumber: data.litigationNumber,
      text: data.text,
      idInternal: data.idInternal,
    });
    if (response.error) {
      toast.error(response.message || "Erro ao importar publicação");
      return false;
    }
    toast.success("Publicação importada com sucesso");
    setIsImportModalOpen(false);
    onRefresh();
    return true;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Publicações</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsModalImportDataOpen(true)}
            className="bg-primary-white hover:bg-primary-white text-primary-blue border border-primary-blue"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar Publicações
          </Button>
          <Button
            onClick={handleOpenImportModal}
            className="bg-primary-blue hover:bg-blue-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Registrar Publicação
          </Button>
        </div>
      </div>

      <PublicationStats />

      <PublicationsTable
        onConfirm={confirmPublication}
        onDiscard={discardPublication}
        onRefresh={onRefresh}
      />

      <ImportPublicationModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        onImport={handleImportPublication}
      />

      <ModalImportData
        isModalOpen={isModalImportDataOpen}
        setIsModalOpen={setIsModalImportDataOpen}
        title="Importar Publicações"
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
            key: litigationColumns.text,
            example: 'Texto da publicação',
            previewWidth: 200,
            variant: ['TEXT', 'TEXTO DA PUBLICAÇÃO'],
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