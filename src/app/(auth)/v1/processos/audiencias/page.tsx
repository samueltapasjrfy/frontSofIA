"use client";
import { useAudiences } from "@/hooks/useAudiences";
import { AudiencesTable } from "@/components/audiences/AudiencesTable";
import { AudiencesStats } from "@/components/audiences/AudiencesStats";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AudiencesPage() {
    const { invalidateQuery } = useAudiences();

    const onRefresh = async () => {
        await invalidateQuery();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Audiências</h1>
                <Button
                    onClick={onRefresh}
                    variant="outline"
                    className="bg-primary-white hover:bg-primary-white text-primary-blue border border-primary-blue"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            <AudiencesStats />

            <AudiencesTable onRefresh={onRefresh} />
        </div>
    );
}