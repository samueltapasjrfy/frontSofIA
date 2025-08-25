import { ProcessApi } from "@/api/processApi";
import { Table } from "../../ui/table";
import { TableHeader } from "../../ui/table";
import { TableRow } from "../../ui/table";
import { TableHead } from "../../ui/table";
import { TableBody } from "../../ui/table";
import { TableCell } from "../../ui/table";
import dayjs from "dayjs";

type ProcessInfoModalRelatedCasesProps = {
    relatedCases: ProcessApi.FindAll.RelatedCase[];
}
export const ProcessInfoModalRelatedCases = ({ relatedCases }: ProcessInfoModalRelatedCasesProps) => {

    return (
        <div className="grid gap-4 py-4">
            {relatedCases.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 border-b">
                            <TableHead>Processo</TableHead>
                            <TableHead className='w-[150px]'>Instância</TableHead>
                            <TableHead className='w-[150px]'>Foro</TableHead>
                            <TableHead className='w-[150px]'>Data de Distribuição</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {relatedCases.map((relatedCase) => (
                            <TableRow key={relatedCase.process}>
                                <TableCell>{relatedCase.process}</TableCell>
                                <TableCell>{relatedCase.instance}</TableCell>
                                <TableCell>{relatedCase.court}</TableCell>
                                <TableCell>{relatedCase.distributionDate ? dayjs(relatedCase.distributionDate).format("DD/MM/YYYY") : "-"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-sm text-gray-500">Nenhum processo relacionado encontrado</div>
            )}
        </div>
    )
}