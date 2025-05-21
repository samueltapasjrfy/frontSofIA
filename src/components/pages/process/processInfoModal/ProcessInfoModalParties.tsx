import { ProcessApi } from "@/api/processApi";
import { Table } from "../../../ui/table";
import { TableHeader } from "../../../ui/table";
import { TableRow } from "../../../ui/table";
import { TableHead } from "../../../ui/table";
import { TableBody } from "../../../ui/table";
import { TableCell } from "../../../ui/table";

type ProcessInfoModalPartiesProps = {
    parties: ProcessApi.FindAll.Process['parties'];
}
export const ProcessInfoModalParties = ({ parties }: ProcessInfoModalPartiesProps) => {

    return (
        <div className="grid gap-4 py-4">
            {parties.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 border-b">
                            <TableHead>Nome</TableHead>
                            <TableHead className='w-[150px]'>Documento</TableHead>
                            <TableHead className='w-[150px]'>Tipo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parties.map((part) => (
                            <TableRow key={part.id}>
                                <TableCell>{part.name}</TableCell>
                                <TableCell>{part.document}</TableCell>
                                <TableCell>{part.type}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-sm text-gray-500">Nenhuma parte encontrada</div>
            )}
        </div>
    )
}