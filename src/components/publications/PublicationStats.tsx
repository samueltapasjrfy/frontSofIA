"use client";

import { PublicationsApi } from "@/api/publicationsApi";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  AlertCircle 
} from "lucide-react";

interface PublicationStatsProps {
  stats: PublicationsApi.Report.Response;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon, bgColor }: StatCardProps) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
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

export function PublicationStats({ stats, className }: PublicationStatsProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 ${className}`}>
      <StatCard
        title="Total"
        value={stats.total}
        icon={<FileText className="h-5 w-5 text-blue-600" />}
        color="text-blue-600"
        bgColor="bg-blue-100"
      />
      <StatCard
        title="Classificadas"
        value={stats.classified}
        icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        color="text-green-600"
        bgColor="bg-green-100"
      />
      <StatCard
        title="Erros"
        value={stats.errors}
        icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        color="text-red-600"
        bgColor="bg-red-100"
      />
      <StatCard
        title="Em Processamento"
        value={stats.processing}
        icon={<Clock className="h-5 w-5 text-blue-600" />}
        color="text-blue-600"
        bgColor="bg-blue-100"
      />
      <StatCard
        title="Pendentes"
        value={stats.pending}
        icon={<AlertCircle className="h-5 w-5 text-yellow-600" />}
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