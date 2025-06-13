import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    iconColor: string
    iconBgColor: string
    badge?: {
        text: string
        variant: "outline" | "default" | "secondary" | "destructive"
        className: string
    }
    suffix?: string
}

export function MetricCard({ title, value, icon: Icon, iconColor, iconBgColor, badge, suffix }: MetricCardProps) {
    return (
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm">
            <CardContent className="px-4 py-0">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <p className={`text-2xl font-bold ${iconColor}`}>{value}</p>
                            {suffix && <span className="text-xs text-gray-500 dark:text-gray-400">{suffix}</span>}
                            {badge && (
                                <Badge variant={badge.variant} className={badge.className}>
                                    {badge.text}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className={`h-10 w-10 rounded-full ${iconBgColor} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 