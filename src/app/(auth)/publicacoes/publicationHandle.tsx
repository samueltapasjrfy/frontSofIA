import { PublicationsApi } from "@/api/publicationsApi";
import { QUERY_KEYS } from "@/constants/cache";
import { usePublications } from "@/hooks/usePublications";
import { usePublicationStats } from "@/hooks/usePublicationStats";
import { useReport } from "@/hooks/useReport";
import { queryClient } from "@/lib/reactQuery";
import { toast } from "sonner";
import { litigationColumns } from "./constants";
import { ImportData } from "@/components/modalImportData/types";
import { RegisterPublication } from "@/components/pages/publications/types";

export const PublicationHandle = () => {
    const { invalidateQuery: invalidatePublications } = usePublications();
    const { invalidateQuery: invalidatePublicationStats } = usePublicationStats();
    const { refreshReport } = useReport();

    const onRefresh = async () => {
        invalidatePublications();
        invalidatePublicationStats();
        refreshReport();
        await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.PUBLICATIONS] });
        await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.PUBLICATION_STATS] });
    }

    const discardPublication = async (id: string) => {
        try {
            await PublicationsApi.delete(id);
            toast.success("Publicação descartada com sucesso");
            onRefresh()
        } catch (error) {
            console.error(error);
            toast.error("Erro ao descartar publicação");
        }
    };

    const confirmPublication = async (publication: PublicationsApi.FindAll.Publication) => {
        try {
            if (!publication?.classifications?.[0]) {
                toast.error("Publicação não possui classificação para aprovar");
                return;
            }

            await PublicationsApi.approveClassification({
                idPublication: publication.id,
                idClassification: publication.classifications[0].id
            });

            toast.success("Classificação aprovada com sucesso");
            invalidatePublications();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao aprovar classificação");
        }
    };

    const handleFinishImport = async ({ rows, expectedColumnsToRows }: ImportData): Promise<boolean> => {
        const params: PublicationsApi.SaveBulk.Params = rows.map((row: { [k: string]: string }) => ({
            litigationNumber: row[expectedColumnsToRows[litigationColumns.litigation]],
            text: row[expectedColumnsToRows[litigationColumns.text]],
            idInternal: row[expectedColumnsToRows[litigationColumns.idInternal]],
        }));
        const response = await PublicationsApi.saveBulk(params);
        if (response.error) {
            toast.error(response.message || "Erro ao importar publicações");
            return false;
        }
        toast.success("Publicações importadas com sucesso");
        setTimeout(onRefresh, 1000);
        return true;
    };

    const handleRegisterPublication = async (data: RegisterPublication): Promise<boolean> => {
        const response = await PublicationsApi.save({
            litigationNumber: data.litigationNumber,
            text: data.text,
            idInternal: data.idInternal,
        });
        if (response.error) {
            toast.error(response.message || "Erro ao importar publicação");
            return false;
        }
        toast.success("Publicação importada com sucesso");
        onRefresh();
        return true;
    };

    return {
        discardPublication,
        confirmPublication,
        handleFinishImport,
        handleRegisterPublication,
        litigationColumns,
        onRefresh,
    }
};

