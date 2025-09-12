"use client";
import { useCitations } from "@/hooks/useCitations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

export function CitationsStats() {
    const { getTotalPendingQuery, getCitationsQuery } = useCitations();

    const { data: pendingData, isLoading, error } = getTotalPendingQuery;
    const { data: citationsData, isLoading: isCitationsLoading, error: citationsError } = getCitationsQuery;
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                            </CardTitle>
                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Citações Pendentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">Erro</div>
                        <p className="text-xs text-muted-foreground">
                            Erro ao carregar dados
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Citações Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-500">
                        {pendingData?.total || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Aguardando aprovação
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Citações</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-500">
                        {citationsData?.total || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Todas as citações
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
