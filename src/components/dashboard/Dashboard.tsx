"use client";

import { useContext } from "react";
import { DashboardContext } from "@/contexts/DashboardContext";
import { StatCard } from "./StatCard";
import { BarChart } from "./BarChart";
import { PieChart } from "./PieChart";
import { RecentPublications } from "./RecentPublications";
import { 
  FileText, 
  Clock,
  TrendingUp,
  Copy
} from "lucide-react";

export function Dashboard() {
  const { dashboardData } = useContext(DashboardContext);

  // Preparar dados para o gráfico de barras
  const confidenceByTypeData = Object.entries(dashboardData.confidenceByType).map(
    ([type, confidence]) => ({
      label: type,
      value: confidence,
    })
  );

  // Preparar dados para o gráfico de pizza
  const publicationDistributionData = Object.entries(
    dashboardData.publicationDistribution
  )
    .filter(([type]) => ["Sentença", "Despacho", "Decisão"].includes(type))
    .map(([type, percentage]) => ({
      label: type,
      value: percentage,
    }));

  return (
    <div className="space-y-4 p-4 pt-0">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <StatCard
          title="Confiança Geral"
          value={`${dashboardData.averageConfidence}%`}
          subtitle={`em relação ao mês anterior`}
          trend={{ value: dashboardData.confidenceTrend, isPositive: dashboardData.confidenceTrend > 0 }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Publicações Processadas"
          value={dashboardData.totalPublications}
          subtitle={`+${dashboardData.publicationsTrend} novas publicações esta semana`}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Horas Economizadas"
          value={10}
          subtitle={`Últimas 2 semanas`}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Duplicidades Encontradas"
          value={147}
          subtitle={`em relação ao mês anterior`}
          trend={{ value: 3, isPositive: true }}
          icon={<Copy className="h-5 w-5" />}
          ribbon="Em Desenvolvimento"
        />
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Visão Geral</h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
          <BarChart
            title="Percentual de Confiança por Tipo"
            description="Média de confiança por tipo de publicação"
            data={confidenceByTypeData}
            maxValue={100}
          />
          <PieChart
            title="Distribuição de Publicações"
            description="Percentual por tipo de publicação"
            data={publicationDistributionData}
          />
        </div>
        <div className="mb-4">
          <RecentPublications
            title="Publicações Recentes"
            description="Últimas publicações adicionadas ao sistema"
            publications={dashboardData.recentPublications}
          />
        </div>
      </div>
    </div>
  );
} 