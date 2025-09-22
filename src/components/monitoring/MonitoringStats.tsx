"use client";
import { useProcesses } from "@/hooks/useProcess";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

export function MonitoringStats() {
    return (
        <></>
    )
    const { getMonitoringProcessesQuery } = useProcesses();

    const processes = getMonitoringProcessesQuery.data?.processes || [];
    const total = getMonitoringProcessesQuery.data?.total || 0;

    // Calcular estatísticas
    const activeProcesses = processes.filter(p => !p.removedAt).length;
    const inactiveProcesses = processes.filter(p => p.removedAt).length;
    const withCitations = processes.filter(p => p.citations && p.citations.length > 0).length;
    const withAudiences = processes.filter(p => p.audiences && p.audiences.length > 0).length;
    const validatedCitations = processes.filter(p =>
        p.citations && p.citations.some(c => c.approved === true)
    ).length;
    const validatedAudiences = processes.filter(p =>
        p.audiences && p.audiences.some(a => a.approved === true)
    ).length;

    const stats = [
        {
            title: "Total de Processos",
            value: total,
            icon: FileText,
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            title: "Processos Ativos",
            value: activeProcesses,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            title: "Processos Inativos",
            value: inactiveProcesses,
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-50"
        },
        {
            title: "Com Citações",
            value: withCitations,
            icon: AlertCircle,
            color: "text-orange-600",
            bgColor: "bg-orange-50"
        },
        {
            title: "Com Audiências",
            value: withAudiences,
            icon: Clock,
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            title: "Citações Validadas",
            value: validatedCitations,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            title: "Audiências Validadas",
            value: validatedAudiences,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50"
        }
    ];

    if (getMonitoringProcessesQuery.isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stat.value.toLocaleString()}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
