import { ProcessApi } from "@/api/processApi";
import { Table } from "../../ui/table";
import { TableHeader } from "../../ui/table";
import { TableRow } from "../../ui/table";
import { TableHead } from "../../ui/table";
import { TableBody } from "../../ui/table";
import { TableCell } from "../../ui/table";

type ProcessInfoModalClassesProps = {
    classes: ProcessApi.FindAll.Process['classes'];
}
export const ProcessInfoModalClasses = ({ classes }: ProcessInfoModalClassesProps) => {

    return (
        <div className="grid gap-4 py-4">
            {classes.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 border-b">
                            <TableHead>Classe</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.map((classe, index) => (
                            <TableRow key={index}>
                                <TableCell>{classe}</TableCell>
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