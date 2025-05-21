import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExpectedColumns, ImportData } from '../types';

type ValidateDateStepProps = {
    rows: ImportData['rows'];
    expectedColumnsToRows: ImportData['expectedColumnsToRows'];
    expectedColumns: ExpectedColumns[];
}

export const ValidateDateStep = ({ rows, expectedColumnsToRows, expectedColumns }: ValidateDateStepProps) => {
    return (
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <p className="mb-4">Total: {rows.length - 1}</p>
            <Table>
                <TableHeader>
                    <TableRow>
                        {expectedColumns.map((column) => (
                            <TableHead key={column.key}>{column.key}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow key={row[expectedColumns[0].key] + index}>
                            {expectedColumns.map((column) => {
                                const columnValue = expectedColumnsToRows[column.key] ? row[expectedColumnsToRows[column.key]] : ''
                                return <TableCell key={column.key}>{String(columnValue).slice(0, 50)}{String(columnValue).length > 50 && '...'}</TableCell>
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}