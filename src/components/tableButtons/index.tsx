import { Download, Filter, RefreshCcw } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "../ui/badge";

type TableButtonsProps = {
    toggleFilters?: () => void;
    totalFilters?: number;
    onExport?: () => Promise<void>;
    onRefresh?: () => Promise<void>;
}
export const TableButtons = ({ toggleFilters, totalFilters, onExport, onRefresh }: TableButtonsProps) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshBlock, setRefreshBlock] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportBlock, setExportBlock] = useState(false);

    const handleExport = async () => {
        if (!onExport) return;
        setIsExporting(true);
        setExportBlock(true);
        await onExport();
        setIsExporting(false);
        setTimeout(() => {
            setExportBlock(false);
        }, 10000);
    }

    const handleRefresh = async () => {
        if (!onRefresh) return;
        setIsRefreshing(true);
        setRefreshBlock(true);
        await onRefresh();
        setIsRefreshing(false);
        setTimeout(() => {
            setRefreshBlock(false);
        }, 10000);
    }
    return (
        <div className="flex gap-2">
            {toggleFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFilters}
                    className={cn(
                        "flex items-center gap-1",
                        "bg-blue-50 border-primary-blue text-primary-blue"
                    )}
                >
                    <Filter className="h-4 w-4" />
                    Filtros
                    {(totalFilters || 0) > 0 && (
                        <Badge className="ml-1 bg-primary-blue text-white">
                            {totalFilters}
                        </Badge>
                    )}
                </Button>
            )}
            {onExport && (
                <Button
                    variant="outline"
                    size="sm"
                    loading={isExporting}
                    disabled={exportBlock}
                    onClick={handleExport}
                    className="flex items-center gap-1"
                >
                    <Download className="h-4 w-4" />
                    Exportar
                </Button>
            )}
            {onRefresh && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshBlock}
                    className={cn(
                        "flex items-center gap-1",
                        "bg-blue-50 border-primary-blue text-primary-blue"
                    )}
                >
                    <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    Recarregar
                </Button>
            )}
        </div>
    );
};
