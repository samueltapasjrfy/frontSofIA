"use client"

import { TableV2 } from '@/components/tablev2'
import { PublicationV2Api } from '@/api/publicationV2Api'
import { useEffect, useState } from 'react'
import { usePublicationsV2 } from '@/hooks/usePublicationsV2'
import { HandleEntitiesButtons } from '@/components/handleEntitiesButtons'
import { ImportPublicationModal } from '@/components/publications/ImportPublicationModal'
import ModalImportData from '@/components/modalImportData/modalImportData'
import { toast } from 'sonner'
import { Pagination } from '@/components/pagination'

const litigationColumns = {
  litigation: 'Processo',
  text: 'Texto',
  idInternal: 'ID',
}

export default function PublicationV2Page() {
  const { getPublicationsQuery, changePage, changeLimit, publicationParams } = usePublicationsV2()
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const handlePublicationAction = (action: string, publication: PublicationV2Api.Publication) => {
    console.log({ action, publication })

  }

  const handleBlockAction = (action: string, block: PublicationV2Api.Block) => {
    console.log({ action, block })
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
    setTimeout(() => {
      getPublicationsQuery.refetch()
    }, 1000);
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
    setTimeout(() => {
      getPublicationsQuery.refetch()
    }, 1000);
    return true;
  };

  const handleDeletePublication = async (id: string) => {
    const response = await PublicationV2Api.delete(id);
    if (response.error) {
      toast.error(response.message || "Erro ao deletar publicação");
      return false;
    }
    toast.success("Publicação deletada com sucesso");
    getPublicationsQuery.refetch()
    return true;
  }

  const handleDeleteBlock = async (id: string) => {
    const response = await PublicationV2Api.deleteBlock(id);
    if (response.error) {
      toast.error(response.message || "Erro ao deletar bloco");
      return false;
    }
    toast.success("Bloco deletado com sucesso");
    getPublicationsQuery.refetch()
    return true;
  }

  const handleValidateBlock = async (id: string, status: 'approve' | 'reprove') => {
    const response = await PublicationV2Api.validateBlock(id, status);
    if (response.error) {
      toast.error(response.message || "Erro ao validar bloco");
      return false;
    }
    toast.success(response.message || "Bloco validado com sucesso");
    getPublicationsQuery.refetch()
    return true;
  }

  const handleValidatePublication = async (id: string, status: 'approve' | 'reprove') => {
    const response = await PublicationV2Api.validatePublication(id, status);
    if (response.error) {
      toast.error(response.message || "Erro ao validar publicação");
      return false;
    }
    toast.success(response.message || "Publicação validada com sucesso");
    getPublicationsQuery.refetch()
    return true;
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-end items-end">
        <HandleEntitiesButtons
          entityName="Publicações"
          handleImport={() => setIsImportModalOpen(true)}
          handleRegister={() => setIsRegisterModalOpen(true)}
        />
      </div>
      <TableV2
        publications={getPublicationsQuery.data?.publications}
        loading={getPublicationsQuery.isLoading}
        onPublicationAction={handlePublicationAction}
        onBlockAction={handleBlockAction}
        total={getPublicationsQuery.data?.total || 0}
        onDelete={handleDeletePublication}
        onDeleteBlock={handleDeleteBlock}
        onValidateBlock={handleValidateBlock}
        onValidatePublication={handleValidatePublication}
        onReload={async () => {
          await getPublicationsQuery.refetch()
        }}
      // filterComponent={<FilterComponent />}
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
