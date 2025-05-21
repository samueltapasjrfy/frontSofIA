import { ProcessApi } from "@/api/processApi";
import { ImportData } from "@/components/modalImportData/types";
import { QUERY_KEYS } from "@/constants/cache";
import { useProcesses } from "@/hooks/useProcess";
import { queryClient } from "@/lib/reactQuery";
import { importProcessColumns } from "./constants";
import { toast } from "sonner";
import { RegisterProcess } from "@/components/pages/process/types";

export const ProcessHandle = () => {
    const { invalidateProcessesQuery, invalidateReport, saveProcesses } = useProcesses();

    const onRefresh = async () => {
        invalidateProcessesQuery();
        invalidateReport();
        await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.PROCESS] });
        await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.PROCESSES] });
        await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.REPORT] });
    }

    const handleFinishImport = async ({ rows, expectedColumnsToRows }: ImportData): Promise<boolean> => {
        const params: ProcessApi.Save.Params = {
            processes: rows.map((row: { [k: string]: string }) => ({
                cnj: row[expectedColumnsToRows[importProcessColumns.litigation]],
                instance: +row[expectedColumnsToRows[importProcessColumns.instance]] || undefined,
                metadata: {
                    idInternal: row[expectedColumnsToRows[importProcessColumns.idInternal]],
                },
            })),
            monitoring: true,
            registration: true,
        };
        const response = await ProcessApi.save(params);
        if (response.error) {
            toast.error(response.message || "Erro ao importar processos");
            return false;
        }
        toast.success("Processos enviados para a fila de importação");
        setTimeout(onRefresh, 1000);
        return true;
    };

    const handleSaveProtocol = async (data: RegisterProcess): Promise<boolean> => {
        const response = await saveProcesses({
            processes: [{
                cnj: data.litigationNumber,
                instance: data.instance,
                metadata: {
                    idInternal: data.idInternal,
                },
            }],
            monitoring: true,
            registration: true,
        });
        if (response.error) {
            toast.error(response.message || "Erro ao registrar processo");
            return false;
        }
        toast.success("Processo registrado com sucesso");
        return true;
    };

    return {
        handleFinishImport,
        handleSaveProtocol,
        onRefresh,
    }
}