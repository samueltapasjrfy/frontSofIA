"use client";

import { createContext, ReactNode, useState, useCallback } from "react";
import { PublicationType, PublicationStatus } from "@/contexts/DashboardContext";

export interface Publication {
  id: string;
  processNumber: string;
  text: string;
  type: PublicationType | null;
  confidence: number | null;
  status: PublicationStatus;
  createdAt: Date;
  processedAt: Date | null;
}

export interface PublicationStats {
  total: number;
  classified: number;
  error: number;
  processing: number;
  pending: number;
  notClassified: number;
}

interface PublicationsContextType {
  publications: Publication[];
  stats: PublicationStats;
  isLoading: boolean;
  addPublication: (data: { processNumber: string; text: string; publicationId?: string }) => Promise<void>;
  updatePublicationStatus: (id: string, status: PublicationStatus) => Promise<void>;
  reclassifyPublication: (id: string) => Promise<void>;
  discardPublication: (id: string) => Promise<void>;
  confirmPublication: (id: string) => Promise<void>;
}

// Dados mockados para desenvolvimento
const generateMockPublications = (count: number): Publication[] => {
  const types: PublicationType[] = ["Sentença", "Despacho", "Decisão", "Acórdão", "Artigo", "Doutrina", "Legislação"];
  const statuses: PublicationStatus[] = ["Classificado", "Pendente", "Em Processamento", "Não Classificado", "Erro"];
  
  const getRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };
  
  const getRandomStatus = (): PublicationStatus => {
    return statuses[Math.floor(Math.random() * statuses.length)];
  };
  
  const getRandomType = (): PublicationType => {
    return types[Math.floor(Math.random() * types.length)];
  };
  
  const getRandomConfidence = (): number => {
    return Math.floor(Math.random() * 30) + 70; // 70-99%
  };
  
  const publications: Publication[] = [];
  
  for (let i = 0; i < count; i++) {
    const status = getRandomStatus();
    const createdAt = getRandomDate(new Date(2023, 0, 1), new Date());
    const processedAt = status === "Pendente" || status === "Em Processamento" 
      ? null 
      : getRandomDate(createdAt, new Date());
    
    publications.push({
      id: `pub-${i + 1000}`,
      processNumber: `${String(Math.floor(Math.random() * 9999999)).padStart(7, '0')}-${String(Math.floor(Math.random() * 99)).padStart(2, '0')}.${2023}.8.26.${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      text: [
        "Vistos. Trata-se de ação de cobrança em fase de cumprimento de sentença. Tendo em vista que a parte executada, devidamente intimada, não efetuou o pagamento voluntário do débito no prazo legal, determino a penhora online de ativos financeiros...",
        "Intime-se a parte autora para que se manifeste, no prazo de 15 (quinze) dias, sobre a contestação e documentos apresentados pela parte ré, nos termos do artigo 350 do Código de Processo Civil. Após, conclusos para decisão...",
        "ACORDAM os Desembargadores integrantes da Câmara Cível do Tribunal de Justiça, por unanimidade de votos, em dar provimento ao recurso, nos termos do voto do Relator. O autor recorre da sentença que julgou improcedente o pedido inicial...",
        "Ante o exposto, JULGO PROCEDENTE o pedido formulado na inicial, com resolução de mérito, nos termos do artigo 487, inciso I, do Código de Processo Civil, para condenar a parte ré ao pagamento da quantia de R$ 25.000,00...",
        "Considerando a certidão retro, redesigno a audiência de conciliação para o dia 15/12/2023, às 14h00. Intimem-se as partes por seus procuradores. Servirá a presente decisão como mandado/ofício...",
      ][i % 5],
      type: status === "Pendente" || status === "Em Processamento" ? null : getRandomType(),
      confidence: status === "Pendente" || status === "Em Processamento" ? null : getRandomConfidence(),
      status,
      createdAt,
      processedAt,
    });
  }
  
  return publications;
};

const mockPublications = generateMockPublications(50);

const calculateStats = (publications: Publication[]): PublicationStats => {
  return {
    total: publications.length,
    classified: publications.filter(p => p.status === "Classificado").length,
    error: publications.filter(p => p.status === "Erro").length,
    processing: publications.filter(p => p.status === "Em Processamento").length,
    pending: publications.filter(p => p.status === "Pendente").length,
    notClassified: publications.filter(p => p.status === "Não Classificado").length,
  };
};

export const PublicationsContext = createContext<PublicationsContextType>({
  publications: [],
  stats: { total: 0, classified: 0, error: 0, processing: 0, pending: 0, notClassified: 0 },
  isLoading: false,
  addPublication: async () => {},
  updatePublicationStatus: async () => {},
  reclassifyPublication: async () => {},
  discardPublication: async () => {},
  confirmPublication: async () => {},
});

interface PublicationsProviderProps {
  children: ReactNode;
}

export function PublicationsProvider({ children }: PublicationsProviderProps) {
  const [publications, setPublications] = useState<Publication[]>(mockPublications);
  const [isLoading, setIsLoading] = useState(false);
  
  const stats = calculateStats(publications);
  
  const addPublication = useCallback(async (data: { processNumber: string; text: string; publicationId?: string }) => {
    setIsLoading(true);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPublication: Publication = {
        id: data.publicationId || `pub-${Date.now()}`,
        processNumber: data.processNumber,
        text: data.text,
        type: null,
        confidence: null,
        status: "Pendente",
        createdAt: new Date(),
        processedAt: null,
      };
      
      setPublications(prev => [newPublication, ...prev]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updatePublicationStatus = useCallback(async (id: string, status: PublicationStatus) => {
    setIsLoading(true);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPublications(prev => 
        prev.map(pub => 
          pub.id === id 
            ? { 
                ...pub, 
                status, 
                processedAt: status === "Pendente" || status === "Em Processamento" ? null : new Date() 
              } 
            : pub
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const reclassifyPublication = useCallback(async (id: string) => {
    await updatePublicationStatus(id, "Em Processamento");
    
    // Simulando o processamento da IA
    setTimeout(async () => {
      const randomStatus: PublicationStatus[] = ["Classificado", "Não Classificado", "Erro"];
      const newStatus = randomStatus[Math.floor(Math.random() * randomStatus.length)];
      
      setPublications(prev => 
        prev.map(pub => 
          pub.id === id 
            ? { 
                ...pub, 
                status: newStatus, 
                type: newStatus === "Classificado" ? (["Sentença", "Despacho", "Decisão"] as PublicationType[])[Math.floor(Math.random() * 3)] : pub.type,
                confidence: newStatus === "Classificado" ? Math.floor(Math.random() * 30) + 70 : pub.confidence,
                processedAt: new Date() 
              } 
            : pub
        )
      );
    }, 2000);
  }, [updatePublicationStatus]);
  
  const discardPublication = useCallback(async (id: string) => {
    setIsLoading(true);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPublications(prev => prev.filter(pub => pub.id !== id));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const confirmPublication = useCallback(async (id: string) => {
    await updatePublicationStatus(id, "Classificado");
  }, [updatePublicationStatus]);
  
  return (
    <PublicationsContext.Provider 
      value={{ 
        publications, 
        stats, 
        isLoading, 
        addPublication, 
        updatePublicationStatus,
        reclassifyPublication,
        discardPublication,
        confirmPublication
      }}
    >
      {children}
    </PublicationsContext.Provider>
  );
} 