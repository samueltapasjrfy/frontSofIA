"use client";
import { useState, useEffect } from "react";
import { PublicationStats } from "@/components/publications/PublicationStats";
import { PublicationsTable } from "@/components/publications/PublicationsTable";
import { ImportPublicationModal } from "@/components/publications/ImportPublicationModal";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { PublicationsApi } from "@/api/publicationsApi";
import { toast } from "sonner"
import ModalImportData from "@/components/modalImportData/modalImportData";

const litigationColumns = {
  litigation: 'Processo',
  text: 'Texto',
  idInternal: 'ID',
}

export default function PublicationsPage() {
  const [publications, setPublications] = useState<PublicationsApi.FindAll.Response>({
    publications: [],
    total: 0
  });
  const [isModalImportDataOpen, setIsModalImportDataOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, size: 10 });
  const [stats, setStats] = useState<PublicationsApi.Report.Response>({
    total: 0,
    classified: 0,
    errors: 0,
    processing: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const discardPublication = async (id: string) => {
    try {
      await PublicationsApi.delete(id);
      toast.success("Publicação descartada com sucesso");
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao descartar publicação");
    }
  };

  const confirmPublication = async (id: string) => {
    try {
      const publication = publications.publications.find(p => p.id === id);
      if (!publication?.classifications?.[0]) {
        toast.error("Publicação não possui classificação para aprovar");
        return;
      }

      await PublicationsApi.approveClassification({
        idPublication: id,
        idClassification: publication.classifications[0].id
      });

      toast.success("Classificação aprovada com sucesso");
      await fetchData();
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
    setTimeout(() => {
      resetPublications();
    }, 1000);
    return true;
  };

  const handleImportPublication = async (data: { litigationNumber: string; text: string; idInternal?: string }): Promise<boolean> => {
    const response = await PublicationsApi.save({
      litigationNumber: data.litigationNumber,
      text: data.text,
      idInternal: data.idInternal,
    });
    console.log(response);
    if (response.error) {
      toast.error(response.message || "Erro ao importar publicação");
      return false;
    }
    toast.success("Publicação importada com sucesso");
    resetPublications();
    setIsImportModalOpen(false);
    return true;
  };

  const resetPublications = async () => {
    if (pagination.page !== 1) return setPagination({ page: 1, size: pagination.size });
    await fetchPublications();
    await fetchStats();
  };

  const fetchPublications = async () => {
    const response = await PublicationsApi.findAll({
      page: pagination.page,
      limit: pagination.size,
    });
    setPublications(response);
  };

  const fetchStats = async () => {
    const response = await PublicationsApi.getStatusReport();
    setStats(response);
  };

  const fetchData = async () => {
    setIsLoading(true);
    await fetchPublications();
    await fetchStats();
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.size]);

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

      <PublicationStats stats={stats} />

      <PublicationsTable
        publications={publications.publications}
        total={publications.total}
        onConfirm={confirmPublication}
        onDiscard={discardPublication}
        pagination={pagination}
        setPagination={setPagination}
        isLoading={isLoading}
        onRefresh={fetchData}
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