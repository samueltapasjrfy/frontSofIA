import { TotalPublicationsCard } from "./TotalPublicationsCard"
import { ProcessingStatusCard } from "./ProcessingStatusCard"
import { MetricCard } from "./MetricCard"
import { CheckCircle2, Clock, BarChart3 } from "lucide-react"

interface PublicationsV2StatsProps {
    stats: {
        total: number
        lastDay: number
        processed: number
        pending: number
        processing: number
        notClassified: number
        errorRate: number
        avgProcessingTime: number
        aiAccuracy: number
        aiAccuracyChange: number
    }
}

export default function PublicationsV2Stats({ stats }: PublicationsV2StatsProps) {
    return (
        <div className="mb-8 space-y-6">
            {/* Main Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TotalPublicationsCard total={stats.total} lastDay={stats.lastDay} />
                <ProcessingStatusCard
                    total={stats.total}
                    processed={stats.processed}
                    pending={stats.pending}
                    processing={stats.processing}
                    unclassified={stats.notClassified}
                />
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 hidden">
                <MetricCard
                    title="Taxa de Erro"
                    value={`${(stats.errorRate || 0) * 100}%`}
                    icon={CheckCircle2}
                    iconColor="text-green-600 dark:text-green-400"
                    iconBgColor="bg-green-50 dark:bg-green-900/20"
                    badge={{
                        text: "Excelente",
                        variant: "outline",
                        className: "text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30"
                    }}
                />

                <MetricCard
                    title="Tempo Médio"
                    value={`${stats.avgProcessingTime}s`}
                    icon={Clock}
                    iconColor="text-blue-600 dark:text-blue-400"
                    iconBgColor="bg-blue-50 dark:bg-blue-900/20"
                    suffix="por doc"
                />

                <MetricCard
                    title="Precisão IA"
                    value={`${(stats.aiAccuracy || 0) * 100}%`}
                    icon={BarChart3}
                    iconColor="text-purple-600 dark:text-purple-400"
                    iconBgColor="bg-purple-50 dark:bg-purple-900/20"
                    badge={{
                        text: `+${(stats.aiAccuracyChange || 0) * 100}%`,
                        variant: "outline",
                        className: "text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30"
                    }}
                />
            </div>
        </div>
    )
}