import { ProcessApi } from "@/api/processApi";
import dayjs from "dayjs";


const labelMap = {
    "Número do Processo": { key: "cnj", type: "text" },
    "Data do Processo": { key: "processCreatedAt", type: "date" },
    "Data de Registro": { key: "createdAt", type: "date" },
    "Status": { key: "status.value", type: "text" },
    "Instância": { key: "instance", type: "text" },
    "Tribunal": { key: "court", type: "text" },
    "Vara": { key: "vara", type: "text" },
    "UF": { key: "uf", type: "text" },
    "Comarca": { key: "judicialDistrict", type: "text" },
    "Área": { key: "area", type: "text" },
    "Valor": { key: "value", type: "text" },
    "Citado": { key: "cited", type: "boolean" },
    "Citado em": { key: "citedAt", type: "date" },
    "Segredo de Justiça": { key: "secret", type: "boolean" },
    "Natureza": { key: "nature", type: "text" },
    "Justiça Gratuita": { key: "legalAid", type: "boolean" },
    "Sistema": { key: "system", type: "text" },
    "Origem": { key: "originalCourt", type: "text" },
    "Liminar": { key: "preliminaryInjunction", type: "boolean" },
    "Juiz": { key: "judge", type: "text" },
    "Observações": { key: "observations", type: "text" },
    "Arquivado": { key: "archived", type: "boolean" },
    "Extinto": { key: "extinct", type: "boolean" },
    "Data da Sentença": { key: "dateSentence", type: "date" },
};


type ProcessInfoModalInfosProps = {
    processInfoSelected: ProcessApi.FindAll.Process | null;
}
export const ProcessInfoModalInfos = ({ processInfoSelected }: ProcessInfoModalInfosProps) => {
    const renderValue = (key: string, type: string) => {
        if (!processInfoSelected) return "";
        const originalValue = key.split('.');
        const value = originalValue.length > 1 ? originalValue.reduce((o: any, i) => {
            if (o) {
                return o[i as keyof ProcessApi.FindAll.Process];
            }
            return "";
        }, processInfoSelected) : processInfoSelected[key as keyof ProcessApi.FindAll.Process];
        if (value === null || value === undefined) return "-";

        if (type === "date") {
            return value ? dayjs(value as string).format("DD/MM/YYYY") : "-";
        }
        if (type === "array") {
            return (value as string[]).join(", ");
        }
        if (type === "boolean") {
            return value ? "Sim" : "Não";
        }
        return value;
    }

    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                {Object.entries(labelMap).map(([label, { key, type }]) => (
                    <div key={key}>
                        <label className="text-sm font-medium  font-bold">{label}: </label>
                        <span>{renderValue(key, type)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}