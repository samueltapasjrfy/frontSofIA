"use client";

import { ReportsTable } from "@/components/reports/ReportsTable";

export default function ReportsPage() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
            <ReportsTable />
        </div>
    );
}
