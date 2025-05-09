import { ProcessApi } from "@/api/processApi";
import dayjs from "dayjs";
import { Table } from "../../ui/table";
import { TableHeader } from "../../ui/table";
import { TableRow } from "../../ui/table";
import { TableHead } from "../../ui/table";
import { TableBody } from "../../ui/table";
import { TableCell } from "../../ui/table";
import { TruncateText } from "@/components/truncateText";
import { useState } from "react";

type ProcessInfoModalAudiencesProps = {
    audiences: ProcessApi.FindAll.Process['audiences'];
}
export const ProcessInfoModalAudiences = ({ audiences }: ProcessInfoModalAudiencesProps) => {
    const [selectedText, setSelectedText] = useState("");

    return (
        <div className="grid gap-4 py-4">
            {audiences.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 border-b">
                            <TableHead>Data</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {audiences.map((audience) => (
                            <TableRow key={new Date().getTime() + Math.random()}>
                                <TableCell>{dayjs(audience.date).format("DD/MM/YYYY")}</TableCell>
                                <TableCell>
                                    <TruncateText
                                        text={audience.text || ""}
                                        maxLength={100}
                                        onClick={() => {
                                            setSelectedText(audience.text || "");
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{audience.type}</TableCell>
                                <TableCell>{audience.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-sm text-gray-500">Nenhuma audiência encontrada</div>
            )}
        </div>
    )
}