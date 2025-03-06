"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className="font-medium">{item.value}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-light-blue">
                <div 
                  className="h-full rounded-full bg-primary-blue" 
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 