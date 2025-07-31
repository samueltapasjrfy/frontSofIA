import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, HelpCircle } from "lucide-react"

interface ProcessingStatusCardProps {
    total: number
    processed: number
    pending: number
    processing: number
    unclassified: number
}

export function ProcessingStatusCard({ total, processed, pending, processing, unclassified }: ProcessingStatusCardProps) {
    let percentage = (processed + unclassified) / total
    percentage = percentage > 1 ? 1 : percentage
    const progress = percentage * 100

    return (
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm lg:col-span-2">
            <CardContent className="px-6 py-0">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status de Processamento</h3>
                    {progress > 0 && (
                        <Badge variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30">
                            {progress.toFixed(1)}% Processadas
                        </Badge>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>Progresso Geral</span>
                        <span>{processed.toLocaleString()} / {total.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: `${progress}%` }}>
                        </div>
                    </div>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatusItem
                        icon={<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />}
                        value={processed}
                        label="Classificadas"
                        bgColor="bg-green-100 dark:bg-green-900/20"
                    />
                    <StatusItem
                        icon={<Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                        value={pending}
                        label="Pendentes"
                        bgColor="bg-amber-100 dark:bg-amber-900/20"
                    />
                    <StatusItem
                        icon={<Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        value={processing}
                        label="Processando"
                        bgColor="bg-blue-100 dark:bg-blue-900/20"
                    />
                    <StatusItem
                        icon={<HelpCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                        value={unclassified}
                        label="Não Classificadas"
                        bgColor="bg-gray-100 dark:bg-gray-700"
                    />
                </div>
            </CardContent>
        </Card>
    )
}

interface StatusItemProps {
    icon: React.ReactNode
    value: number
    label: string
    bgColor: string
}

function StatusItem({ icon, value, label, bgColor }: StatusItemProps) {
    return (
        <div className="text-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor} mx-auto mb-2`}>
                {icon}
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    )
} 