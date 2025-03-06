"use client";

import { useState, useContext } from "react";
import { PublicationsContext } from "@/contexts/PublicationsContext";
import { PublicationStats } from "@/components/publications/PublicationStats";
import { PublicationsTable } from "@/components/publications/PublicationsTable";
import { ImportPublicationModal } from "@/components/publications/ImportPublicationModal";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function PublicationsPage() {
  const { 
    publications, 
    stats, 
    isLoading, 
    addPublication, 
    confirmPublication, 
    discardPublication, 
    reclassifyPublication 
  } = useContext(PublicationsContext);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
  };

  const handleImportPublication = async (data: { processNumber: string; text: string; publicationId?: string }) => {
    await addPublication(data);
    setIsImportModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Publicações</h1>
        <Button 
          onClick={handleOpenImportModal}
          className="bg-primary-blue hover:bg-blue-700 text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          Importar Publicação
        </Button>
      </div>

      <PublicationStats stats={stats} />

      <PublicationsTable 
        publications={publications}
        onConfirm={confirmPublication}
        onDiscard={discardPublication}
        onReclassify={reclassifyPublication}
        isLoading={isLoading}
      />

      <ImportPublicationModal 
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        onImport={handleImportPublication}
      />
    </div>
  );
} 