"use client";

import { Card, CardContent } from "@/components/ui/card";
import { usePublicationStats } from "@/hooks/usePublicationStats";
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  AlertCircle 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicationStatsProps {
  className?: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface StatCardSkeletonProps {
  bgColor: string;
}

function StatCardSkeleton({ bgColor }: StatCardSkeletonProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12 mt-1" />
          </div>
          <div className={`p-3 rounded-full ${bgColor}`}>
            <Skeleton className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value, icon, bgColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${bgColor}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PublicationStats({ className }: PublicationStatsProps) {
  const { getPublicationStatsQuery } = usePublicationStats();
  if (getPublicationStatsQuery.isLoading) {
    return (
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 ${className}`}>
        <StatCardSkeleton bgColor="bg-blue-100" />
        <StatCardSkeleton bgColor="bg-green-100" />
        <StatCardSkeleton bgColor="bg-red-100" />
        <StatCardSkeleton bgColor="bg-blue-100" />
        <StatCardSkeleton bgColor="bg-yellow-100" />
        <StatCardSkeleton bgColor="bg-gray-100" />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 ${className}`}>
      <StatCard
        title="Total"
        value={getPublicationStatsQuery.data?.total || 0}
        icon={<FileText className="h-5 w-5 text-blue-600" />}
        color="text-blue-600"
        bgColor="bg-blue-100"
      />
      <StatCard
        title="Classificadas"
        value={getPublicationStatsQuery.data?.classified || 0}
        icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        color="text-green-600"
        bgColor="bg-green-100"
      />
      <StatCard
        title="Erros"
        value={getPublicationStatsQuery.data?.errors || 0}
        icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        color="text-red-600"
        bgColor="bg-red-100"
      />
      <StatCard
        title="Em Processamento"
        value={getPublicationStatsQuery.data?.processing || 0}
        icon={<Clock className="h-5 w-5 text-blue-600" />}
        color="text-blue-600"
        bgColor="bg-blue-100"
      />
      <StatCard
        title="Pendentes"
        value={getPublicationStatsQuery.data?.pending || 0}
        icon={<Clock className="h-5 w-5 text-yellow-600" />}
        color="text-yellow-600"
        bgColor="bg-yellow-100"
      />
      <StatCard
        title="Não Classificadas"
        value={0}
        icon={<HelpCircle className="h-5 w-5 text-gray-600" />}
        color="text-gray-600"
        bgColor="bg-gray-100"
      />
    </div>
  );
} 