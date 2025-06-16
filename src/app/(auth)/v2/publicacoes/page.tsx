"use client"

import { TablePublicationsV2 } from '@/components/publicationsV2/tablePublicationsv2'
import { PublicationV2Api } from '@/api/publicationV2Api'
import { useState } from 'react'
import { usePublicationsV2 } from '@/hooks/usePublicationsV2'
import { HandleEntitiesButtons } from '@/components/handleEntitiesButtons'
import { ImportPublicationModal } from '@/components/publications/ImportPublicationModal'
import ModalImportData from '@/components/modalImportData/modalImportData'
import { toast } from 'sonner'
import { Pagination } from '@/components/pagination'
import { FilterComponent } from './filterComponent'
import PublicationsV2Stats from '@/components/publicationsV2/stats'
import { usePublicationsV2Stats } from '@/hooks/usePublicationsV2Stats'

const litigationColumns = {
  litigation: 'Processo',
  text: 'Texto',
  idInternal: 'ID',
}

export default function PublicationV2Page() {
  const { getPublicationsQuery, changePage, changeLimit, publicationParams, changeFilter, resetFilters, invalidateQuery: invalidateQueryPublications } = usePublicationsV2()
  const { getTotalQuery, getStatisticsQuery, getProcessingStatusQuery, invalidateQueries: invalidateQueriesPublicationsStatus } = usePublicationsV2Stats()
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const resetPageCache = (time: number = 1000) => {
    setTimeout(() => {
      invalidateQueryPublications()
      invalidateQueriesPublicationsStatus()
    }, time)
  }

  const handleRegisterPublication = async (data: { litigationNumber: string; text: string; idInternal?: string }) => {
    const params: PublicationV2Api.Save.Params = [
      {
        idInternal: data.idInternal,
        cnj: data.litigationNumber,
        text: data.text,
      }
    ]
    const response = await PublicationV2Api.save(params);
    if (response.error) {
      toast.error(response.message || "Erro ao importar publicação");
      return false;
    }
    toast.success("Publicação importada com sucesso");
    setIsRegisterModalOpen(false);
    resetPageCache()
    return true
  }

  const handleFinishImport = async (
    rows: Array<{ [k: string]: string }>,
    expectedColumnsToRows: { [k: string]: string },
  ): Promise<boolean> => {
    const params: PublicationV2Api.Save.Params = rows.map((row: { [k: string]: string }) => ({
      idInternal: row[expectedColumnsToRows[litigationColumns.idInternal]],
      cnj: row[expectedColumnsToRows[litigationColumns.litigation]],
      caseType: 1,
      text: row[expectedColumnsToRows[litigationColumns.text]],

    }));
    const response = await PublicationV2Api.save(params);
    if (response.error) {
      toast.error(response.message || "Erro ao importar publicações");
      return false;
    }
    toast.success("Publicações importadas com sucesso");
    setIsImportModalOpen(false);
    resetPageCache()
    return true;
  };

  const handleDeletePublication = async (id: string) => {
    const response = await PublicationV2Api.delete(id);
    if (response.error) {
      toast.error(response.message || "Erro ao deletar publicação");
      return false;
    }
    toast.success("Publicação deletada com sucesso");
    resetPageCache(100)
    return true;
  }

  const handleDeleteBlock = async (id: string) => {
    const response = await PublicationV2Api.deleteBlock(id);
    if (response.error) {
      toast.error(response.message || "Erro ao deletar bloco");
      return false;
    }
    toast.success("Bloco deletado com sucesso");
    resetPageCache(100)
    return true;
  }

  const handleValidateBlock = async (id: string, status: 'approve' | 'reprove') => {
    const response = await PublicationV2Api.validateBlock(id, status);
    if (response.error) {
      toast.error(response.message || "Erro ao validar bloco");
      return false;
    }
    toast.success(response.message || "Bloco validado com sucesso");
    resetPageCache(100)
    return true;
  }

  const handleValidatePublication = async (id: string, status: 'approve' | 'reprove') => {
    const response = await PublicationV2Api.validatePublication(id, status);
    if (response.error) {
      toast.error(response.message || "Erro ao validar publicação");
      return false;
    }
    toast.success(response.message || "Publicação validada com sucesso");
    resetPageCache(100)
    return true;
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex justify-end items-end">
        <HandleEntitiesButtons
          entityName="Publicações"
          handleImport={() => setIsImportModalOpen(true)}
          handleRegister={() => setIsRegisterModalOpen(true)}
        />
      </div>
      <div>
        <PublicationsV2Stats stats={{
          total: getTotalQuery.data?.total || 0,
          lastDay: getTotalQuery.data?.lastDay || 0,
          processed: getProcessingStatusQuery.data?.classified || 0,
          pending: getProcessingStatusQuery.data?.pending || 0,
          processing: getProcessingStatusQuery.data?.processing || 0,
          notClassified: getProcessingStatusQuery.data?.notClassified || 0,
          errorRate: getStatisticsQuery.data?.errorsPercentage || 0,
          avgProcessingTime: getStatisticsQuery.data?.avgTime || 0,
          aiAccuracy: getStatisticsQuery.data?.precision || 0,
          aiAccuracyChange: getStatisticsQuery.data?.precision || 0,
        }} />
      </div>
      <div>

        <TablePublicationsV2
          publications={getPublicationsQuery.data?.publications}
          loading={getPublicationsQuery.isLoading}
          total={getPublicationsQuery.data?.total || 0}
          onDelete={handleDeletePublication}
          onDeleteBlock={handleDeleteBlock}
          onValidateBlock={handleValidateBlock}
          onValidatePublication={handleValidatePublication}
          onReload={async () => {
            resetPageCache(1)
          }}
          filterComponent={
            <FilterComponent
              onFilterChange={changeFilter}
              onResetFilters={resetFilters}
              limit={publicationParams.limit || 10}
            />
          }
        // onExport={() => {
        //   console.log("Exportando dados")
        // }}
        />
        <Pagination
          total={getPublicationsQuery.data?.total || 0}
          pagination={{
            page: publicationParams.page || 1,
            limit: publicationParams.limit || 10
          }}
          setPagination={({ page, limit }) => {
            // Se o limit mudou, usamos changeLimit (que já reseta página para 1)
            if (limit !== publicationParams.limit) {
              changeLimit(limit);
            }
            // Se apenas a página mudou, usamos changePage
            else if (page !== publicationParams.page) {
              changePage(page);
            }
          }}
        />
      </div>
      <ImportPublicationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onImport={handleRegisterPublication}
      />

      <ModalImportData
        isModalOpen={isImportModalOpen}
        setIsModalOpen={setIsImportModalOpen}
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
  )
}
