"use client";

import { createContext, ReactNode, useState } from "react";

export type PublicationType =
  | "Sentença"
  | "Artigo"
  | "Acórdão"
  | "Doutrina"
  | "Legislação"
  | "Despacho"
  | "Decisão";

export type PublicationStatus =
  | "Pendente"
  | "Em Processamento"
  | "Classificado"
  | "Não Classificado"
  | "Erro";

export type Publication = {
  processNumber: string;
  text: string;
  author: string;
  type: PublicationType;
  confidence: number;
  status: PublicationStatus;
};

export type DashboardData = {
  totalPublications: number;
  publicationsTrend: number;
  totalCitations: number;
  citationsTrend: number;
  timeSaved: number;
  timeSavedTrend: number;
  averageConfidence: number;
  confidenceTrend: number;
  confidenceByType: Record<PublicationType, number>;
  publicationDistribution: Record<PublicationType, number>;
  recentPublications: Publication[];
};

const mockDashboardData: DashboardData = {
  totalPublications: 1458,
  publicationsTrend: 12,
  totalCitations: 3245,
  citationsTrend: 8,
  timeSaved: 128,
  timeSavedTrend: 23,
  averageConfidence: 87,
  confidenceTrend: 5,
  confidenceByType: {
    Sentença: 92,
    Artigo: 78,
    Acórdão: 85,
    Doutrina: 72,
    Legislação: 95,
    Despacho: 85,
    Decisão: 78,
  },
  publicationDistribution: {
    Sentença: 35,
    Artigo: 15,
    Acórdão: 20,
    Doutrina: 5,
    Legislação: 10,
    Despacho: 10,
    Decisão: 5,
  },
  recentPublications: [
    {
      processNumber: "0001234-56.2023.8.26.0100",
      text: "Vistos. Trata-se de ação de cobrança em fase de cumprimento de sentença. Tendo em vista que a parte executada, devidamente intimada, não efetuou o pagamento voluntário do débito no prazo legal, determino a penhora online de ativos financeiros...",
      author: "Ministro João Silva",
      type: "Sentença",
      confidence: 92,
      status: "Classificado",
    },
    {
      processNumber: "0002345-67.2023.8.26.0100",
      text: "Intime-se a parte autora para que se manifeste, no prazo de 15 (quinze) dias, sobre a contestação e documentos apresentados pela parte ré, nos termos do artigo 350 do Código de Processo Civil. Após, conclusos para decisão...",
      author: "Juiz Pedro Santos",
      type: "Despacho",
      confidence: 85,
      status: "Pendente",
    },
    {
      processNumber: "0003456-78.2023.8.26.0100",
      text: "ACORDAM os Desembargadores integrantes da Câmara Cível do Tribunal de Justiça, por unanimidade de votos, em dar provimento ao recurso, nos termos do voto do Relator. O autor recorre da sentença que julgou improcedente o pedido inicial...",
      author: "Desembargadora Ana Oliveira",
      type: "Decisão",
      confidence: 78,
      status: "Em Processamento",
    },
    {
      processNumber: "0004567-89.2023.8.26.0100",
      text: "Ante o exposto, JULGO PROCEDENTE o pedido formulado na inicial, com resolução de mérito, nos termos do artigo 487, inciso I, do Código de Processo Civil, para condenar a parte ré ao pagamento da quantia de R$ 25.000,00...",
      author: "Juiz Carlos Mendes",
      type: "Sentença",
      confidence: 88,
      status: "Não Classificado",
    },
    {
      processNumber: "0005678-90.2023.8.26.0100",
      text: "Considerando a certidão retro, redesigno a audiência de conciliação para o dia 15/12/2023, às 14h00. Intimem-se as partes por seus procuradores. Servirá a presente decisão como mandado/ofício...",
      author: "Juíza Maria Costa",
      type: "Despacho",
      confidence: 82,
      status: "Erro",
    },
  ],
};

interface DashboardContextType {
  dashboardData: DashboardData;
}

export const DashboardContext = createContext<DashboardContextType>({
  dashboardData: mockDashboardData,
});

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [dashboardData] = useState<DashboardData>(mockDashboardData);

  return (
    <DashboardContext.Provider value={{ dashboardData }}>
      {children}
    </DashboardContext.Provider>
  );
} 