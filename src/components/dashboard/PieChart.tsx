"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PieChartProps {
  title: string;
  description?: string;
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  className?: string;
}

export function PieChart({
  title,
  description,
  data,
  className,
}: PieChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cores mais vivas para cada categoria
  const categoryColors: Record<string, string> = {
    "Sentença": "#2ecc71", // Verde mais vivo
    "Despacho": "#ff6b81", // Rosa mais vivo
    "Decisão": "#ffd32a", // Amarelo mais vivo
  };

  // Filtrar apenas as três categorias que queremos
  const filteredData = data.filter(item => 
    item.label === "Sentença" || 
    item.label === "Despacho" || 
    item.label === "Decisão"
  );

  // Calcular o total para as porcentagens
  const total = filteredData.reduce((acc, item) => acc + item.value, 0);

  // Calcular os ângulos para cada fatia
  let startAngle = 0;
  const segments = filteredData.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle,
      endAngle: startAngle + angle,
      color: categoryColors[item.label],
    };
    startAngle += angle;
    return segment;
  });

  if (!isMounted) {
    return (
      <Card className={cn("overflow-hidden bg-white border h-full", className)}>
        <CardHeader className="bg-white">
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
        <CardContent className="flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="relative h-64 w-64 bg-gray-200 rounded-full"></div>
            <div className="mt-4 flex justify-center gap-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-300" />
                  <div className="text-sm bg-gray-300 w-20 h-4"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden bg-white border h-full", className)}>
      <CardHeader className="bg-white">
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="relative h-64 w-64">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              {/* Fundo branco para o gráfico */}
              <circle cx="50" cy="50" r="50" fill="white" />
              
              {segments.map((segment, index) => {
                // Reduzir ligeiramente o raio para criar espaço entre as fatias
                const radius = 45;
                // Adicionar um pequeno espaço entre as fatias reduzindo o ângulo
                const startAngle = segment.startAngle + 0.5;
                const endAngle = segment.endAngle - 0.5;
                
                const x1 = 50 + radius * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 50 + radius * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 50 + radius * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 50 + radius * Math.sin((endAngle * Math.PI) / 180);
                
                const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                
                return (
                  <path
                    key={index}
                    d={`M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="0.8"
                  />
                );
              })}
              
              {segments.map((segment) => {
                const midAngle = (segment.startAngle + segment.endAngle) / 2;
                const x = 50 + 32 * Math.cos((midAngle * Math.PI) / 180);
                const y = 50 + 32 * Math.sin((midAngle * Math.PI) / 180);
                
                const textRotation = midAngle + 90;
                
                return (
                  <text
                    key={`text-${segment.label}`}
                    x={x}
                    y={y}
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotation}, ${x}, ${y})`}
                  >
                    {Math.round(segment.percentage)}%
                  </text>
                );
              })}
              
              {/* Círculo branco no centro para criar efeito de donut */}
              <circle cx="50" cy="50" r="25" fill="white" />
            </svg>
          </div>
          
          <div className="mt-6 flex justify-center gap-6">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <div className="text-sm font-medium">
                  <span>{segment.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 