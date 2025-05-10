"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  CheckCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProcesses } from "@/hooks/useProcess";

interface ProcessStatsProps {
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

export function ProcessStats({ className }: ProcessStatsProps) {
  const { getReport } = useProcesses();

  return (
    <>
      {getReport.isLoading ? (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 ${className}`}>
          <StatCardSkeleton bgColor="bg-blue-100" />
          <StatCardSkeleton bgColor="bg-green-100" />
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 ${className}`}>
          <StatCard
            title="Total"
            value={getReport.data?.total || 0}
            icon={<FileText className="h-5 w-5 text-blue-600" />}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            title="Monitorando"
            value={getReport.data?.monitored || 0}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            color="text-green-600"
            bgColor="bg-green-100"
          />
        </div>
      )}
    </>
  );
} 