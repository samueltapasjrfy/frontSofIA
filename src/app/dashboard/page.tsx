import { NoSSR } from "@/components/NoSSR";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  return (
    <NoSSR fallback={<div className="p-8">Carregando dashboard...</div>}>
      <Dashboard />
    </NoSSR>
  );
} 