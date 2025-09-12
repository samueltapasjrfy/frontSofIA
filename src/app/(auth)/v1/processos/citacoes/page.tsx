"use client";
import { useCitations } from "@/hooks/useCitations";
import { CitationsTable } from "@/components/citations/CitationsTable";
import { CitationsStats } from "@/components/citations/CitationsStats";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CitationsPage() {
    const { invalidateQuery } = useCitations();

    const onRefresh = async () => {
        await invalidateQuery();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Citações</h1>
                <Button
                    onClick={onRefresh}
                    variant="outline"
                    className="bg-primary-white hover:bg-primary-white text-primary-blue border border-primary-blue"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            <CitationsStats />

            <CitationsTable onRefresh={onRefresh} />
        </div>
    );
}