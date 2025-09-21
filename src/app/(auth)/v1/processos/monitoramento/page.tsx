"use client";
import { useProcesses } from "@/hooks/useProcess";
import { MonitoringTable } from "@/components/monitoring/MonitoringTable";
import { MonitoringStats } from "@/components/monitoring/MonitoringStats";

export default function MonitoringPage() {
    const { invalidateMonitoringQuery } = useProcesses();

    const onRefresh = async () => {
        await invalidateMonitoringQuery();
    };

    return (
        <div className="p-6 space-y-6">
            <MonitoringStats />

            <MonitoringTable onRefresh={onRefresh} />
        </div>
    );
}
