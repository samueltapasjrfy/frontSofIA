import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

interface TotalPublicationsCardProps {
    total: number
    lastDay: number
}

export function TotalPublicationsCard({ total, lastDay }: TotalPublicationsCardProps) {
    return (
        <Card className="lg:col-span-1">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total de Publicações</p>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{total.toLocaleString()}</p>
                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Último dia: {lastDay > 0 && '+'}{lastDay}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 