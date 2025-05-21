"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toPercent } from "@/utils/toPercent";

interface BarChartProps {
  title: string;
  description?: string;
  data: {
    label: string;
    value: number;
  }[];
  maxValue?: number;
  className?: string;
}

export function BarChart({
  title,
  description,
  data,
  maxValue = 100,
  className,
}: BarChartProps) {
  return (
    <Card className={cn("overflow-hidden bg-white border", className)}>
      <CardHeader className="bg-white">
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="h-full">
        <div className="space-y-4 h-full">
          {data.length > 0 ? (
            data.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-light-blue">
                  <div
                    className="h-full rounded-full bg-primary-blue"
                    style={{ width: `${toPercent(item.value / maxValue)}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 