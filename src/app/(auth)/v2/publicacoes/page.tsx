"use client"

import { TableV2 } from '@/components/tablev2'
import { PublicationV2Api } from '@/api/publicationV2Api'
import { useEffect, useState } from 'react'
import { usePublicationsV2 } from '@/hooks/usePublicationsV2'
import { HandleEntitiesButtons } from '@/components/handleEntitiesButtons'
import { Button } from '@/components/ui/button'
import { Check, Trash } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ImportPublicationModal } from '@/components/publications/ImportPublicationModal'
import ModalImportData from '@/components/modalImportData/modalImportData'
import { toast } from 'sonner'

const litigationColumns = {
  litigation: 'Processo',
  text: 'Texto',
  idInternal: 'ID',
}

export function TableV2Example() {
  const { getPublicationsQuery } = usePublicationsV2()
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const handlePublicationAction = (action: string, publication: PublicationV2Api.Publication) => {

  }

  const handleBlockAction = (action: string, block: PublicationV2Api.Block) => {

  }

  const handleImportPublication = async (data: { litigationNumber: string; text: string; idInternal?: string }) => {
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
    return true
  }

  useEffect(() => {
    console.log(getPublicationsQuery?.data?.publications)
    if (getPublicationsQuery.data?.publications) {
    }
  }, [getPublicationsQuery.data])

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
        onReload={() => {
          getPublicationsQuery.refetch()
        }}
      // filterComponent={<FilterComponent />}
      // onExport={() => {
      //   console.log("Exportando dados")
      // }}
      />
      <ImportPublicationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onImport={handleImportPublication}
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


export default TableV2Example 