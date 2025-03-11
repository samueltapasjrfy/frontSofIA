"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number | ReactNode;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
  ribbon?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  ribbon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border rounded-lg relative", className)}>
      {ribbon && (
        <>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-yellow-500 text-white px-6 py-2 rounded-lg flex items-center gap-3 transform rotate-[-5deg] shadow-lg border-2 border-yellow-600">
              <AlertTriangleIcon className="h-5 w-5" />
              <span className="font-bold text-base">{ribbon}</span>
            </div>
          </div>
        </>
      )}
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className={cn("text-sm font-medium", 
              ribbon ? "text-gray-400" : "text-gray-600"
            )}>{title}</p>
            <h3 className={cn("text-2xl font-bold mt-1", 
              ribbon ? "text-gray-400" : ""
            )}>{value}</h3>
            
            {trend ? (
              <div className="flex items-center mt-0.5">
                <span
                  className={cn(
                    "text-xs font-medium flex items-center",
                    trend.isPositive 
                      ? ribbon ? "text-green-400" : "text-green-600" 
                      : ribbon ? "text-red-400" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? (
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                  )}
                  {trend.value}%
                </span>
                {subtitle && (
                  <span className={cn("text-xs ml-1", 
                    ribbon ? "text-gray-400" : "text-gray-500"
                  )}>
                    {subtitle}
                  </span>
                )}
              </div>
            ) : subtitle ? (
              <p className={cn("text-xs mt-0.5", 
                ribbon ? "text-gray-400" : "text-gray-500"
              )}>{subtitle}</p>
            ) : null}
          </div>
          
          {icon && (
            <div className={cn(
              ribbon ? "text-gray-300" : "text-gray-400"
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 