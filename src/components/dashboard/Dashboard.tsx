"use client";

import { StatCard } from "./StatCard";
import { BarChart } from "./BarChart";
import { PieChart } from "./PieChart";
import { RecentPublications } from "./RecentPublications";
import {
  FileText,
  Clock,
  TrendingUp,
  Copy,
} from "lucide-react";
import { useReport } from "@/hooks/useReport";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublications } from "@/hooks/usePublications";
import { useEffect } from "react";
import { getLocalStorage, LocalStorageKeys, setLocalStorage } from "@/utils/localStorage";
import { LoginResponse, renewToken } from "@/api/authApi";

export function Dashboard() {
  const { report, classificationConfidence, classificationPercentage, isLoading } = useReport("");
  const { getPublicationsQuery } = usePublications();

  useEffect(() => {
    const handleRenewToken = async () => {
      const userData = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)
      const response = await renewToken(userData.token)
      userData.token = response.token
      setLocalStorage(LocalStorageKeys.USER, userData)
    }
    handleRenewToken()
  }, [])
  // Custom skeleton card component
  const SkeletonCard = ({ title }: { title: string }) => (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-full">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <Skeleton className="h-8 w-20" />
          <div className="flex items-center mt-1">
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );

  // Custom skeleton chart component
  const SkeletonChart = ({ title }: { title: string }) => (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">Carregando dados...</p>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 p-4 pt-0">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        {isLoading ? (
          <SkeletonCard title="Confiança Geral" />
        ) : (
          <StatCard
            title="Confiança Geral"
            value={report?.confidence?.average ? `${report?.confidence?.average}%` : "--"}
            subtitle={report?.confidence?.trendPercentage ? `em relação ao mês anterior` : ""}
            trend={report?.confidence?.trendPercentage ? {
              value: report?.confidence?.trendPercentage || 0,
              isPositive: (report?.confidence?.trendPercentage || 0) > 0
            } : undefined}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        )}

        {isLoading ? (
          <SkeletonCard title="Publicações Processadas" />
        ) : (
          <StatCard
            title="Publicações Processadas"
            value={report?.publications?.total || 0}
            subtitle={(report?.publications?.trend || 0) > 0 ? `+${report?.publications?.trend || 0} novas publicações esta semana` : ""}
            icon={<FileText className="h-5 w-5" />}
          />
        )}

        <StatCard
          title="Horas Economizadas"
          value={0}
          subtitle={`Últimas 2 semanas`}
          icon={<Clock className="h-5 w-5" />}
          ribbon="Em Desenvolvimento"
        />
        <StatCard
          title="Duplicidades Encontradas"
          value={0}
          // trend={{ value: 0, isPositive: true }}
          // subtitle={`em relação ao mês anterior`}
          icon={<Copy className="h-5 w-5" />}
          ribbon="Em Desenvolvimento"
        />
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Visão Geral</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4 " style={{ minHeight: '300px' }}>
          {isLoading ? (
            <SkeletonChart title="Percentual de Confiança por Tipo" />
          ) : (
            <>
              <BarChart
                title="Percentual de Confiança por Tipo"
                description="Média de confiança por classificação"
                data={(classificationConfidence?.classifications || []).map(item => ({
                  label: item.name,
                  value: item.averageConfidence * 100
                })).slice(0, 7)}
                maxValue={100}
              />
            </>
          )}
          {isLoading ? (
            <SkeletonChart title="Distribuição de Publicações" />
          ) : (
            <PieChart
              title="Distribuição de Publicações"
              description="Percentual por tipo de publicação"
              isLoading={isLoading}
              data={(classificationPercentage?.classifications || []).map(item => ({
                label: item.name,
                value: item.percentage,
              })).slice(0, 5)}
            />
          )}
        </div>
        <div className="mb-4">
          <RecentPublications
            title="Publicações Recentes"
            description="Últimas publicações adicionadas ao sistema"
            publications={(getPublicationsQuery.data?.publications || []).slice(0, 5)}
          />
        </div>
      </div>
    </div>
  );
} 