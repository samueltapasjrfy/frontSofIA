import Select from 'react-select';
import { ExpectedColumns, ImportData } from "../types";

type ValidateColumnsStepProps = {
    rows: ImportData['rows'];
    expectedColumnsToRows: ImportData['expectedColumnsToRows'];
    expectedColumns: ExpectedColumns[];
    handleChangeColumnSelect: (rowKey: string, optionValue: string) => void;
}
export const ValidateColumnsStep = ({ rows, expectedColumnsToRows, expectedColumns, handleChangeColumnSelect }: ValidateColumnsStepProps) => {
    return (
        <div className="max-w-[1100px]">
            <h3 className="text-lg font-semibold mb-4">Sua tabela</h3>
            <div className="flex justify-around flex-col overflow-x-auto">
                <div className="flex flex-row">
                    {(Array.isArray(rows) && rows.length > 0) &&
                        Object.keys(rows[0]).map((row) => (
                            <div key={row} className="validate-column-box">
                                <b className="text-sm">{row}</b>
                                <div className="mt-2" />
                                <span style={{ color: 'rgba(0,0,0,.5)' }}>{String(rows[0][row]).slice(0, 50)}{String(rows[0][row]).length > 50 && '...'}</span>
                                <div className="mt-2" />
                                <span style={{ color: 'rgba(0,0,0,.2)' }}>
                                    {rows.length > 1 && (String(rows[1][row]).slice(0, 50) + (String(rows[1][row]).length > 50 ? '...' : ''))}
                                </span>
                            </div>
                        ))}
                </div>
                <div className="mt-12" />
                <h3 className="text-lg font-semibold mb-4">Se tornará</h3>
                <div className="flex flex-row pb-10 ">
                    {(Array.isArray(rows) && rows.length > 0) &&
                        Object.keys(rows[0]).map((rowKey) => (
                            <div key={rowKey} className="validate-column-box select-column-box" >
                                <Select<{ value: string; label: string }>
                                    key={JSON.stringify(expectedColumnsToRows)}
                                    className="w-full text-sm"
                                    placeholder="Selecione uma coluna"
                                    value={
                                        Object.keys(expectedColumnsToRows).find((key) => expectedColumnsToRows[key] === rowKey) ? {
                                            value: expectedColumnsToRows[rowKey],
                                            label: Object.keys(expectedColumnsToRows).find((key) => expectedColumnsToRows[key] === rowKey) || '',
                                        } : undefined
                                    }
                                    onChange={(option) => handleChangeColumnSelect(rowKey, option?.value || '')}
                                    options={expectedColumns.map((column) => ({
                                        value: column.key,
                                        label: `${column.key} ${(expectedColumnsToRows &&
                                            column.key &&
                                            expectedColumnsToRows[column.key]) &&
                                            '✓'
                                            }`,
                                    }))}
                                />
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}