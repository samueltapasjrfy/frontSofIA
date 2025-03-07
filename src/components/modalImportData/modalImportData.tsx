import "./modalImportData.css"
import { useEffect, useState } from 'react';
import { read as readXlsx, utils as utilsXlsx } from 'xlsx';
import { normalizeString } from '@/utils/str';
import { Button } from '../ui/button';
import Select from 'react-select';

import { LucideDownload } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import FileDropzone from '../drop-zone';
import { DialogHeader } from "../ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ModalImportFormStepper } from "./modalImportFormStepper";
import { toast } from "sonner";

enum STEPS {
  UPLOAD_FILE = 1,
  VALIDATE_COLUMNS = 2,
  VALIDATE_DATE = 3,
}

interface VerifyColumnsResponse {
  columns: { [k: string]: string };
  hasAll: boolean;
}

interface ModalImportDataProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  finish: (
    rows: Array<{ [k: string]: string }>,
    expectedColumnsToRows: { [k: string]: string },
  ) => Promise<boolean>;
  docExampleUrl?: string;
  expectedColumns: {
    key: string;
    example: string | number;
    previewWidth?: number;
    variant?: string[];
  }[];
}

const ModalImportData = ({
  isModalOpen,
  setIsModalOpen,
  title,
  expectedColumns,
  finish,
  docExampleUrl,
}: ModalImportDataProps) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(true);
  const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD_FILE);
  const [errorStep, setErrorStep] = useState<number | undefined>(undefined);
  const [rows, setRows] = useState<Array<{ [k: string]: string }>>([]);
  const [expectedColumnsToRows, setExpectedColumnsToRows] = useState<{ [k: string]: string }>({});

  const exampleColumnNumber = 13;

  const handleCancel = () => {
    setCurrentStep(STEPS.UPLOAD_FILE);
    setErrorStep(undefined);
    setErrorMessage('');
    setIsModalOpen(false);
  };

  const verifyColumns = (sheetRows: Array<{ [k: string]: string }>): VerifyColumnsResponse => {
    if (!sheetRows.length) return { columns: {}, hasAll: false };
    const columns: { [k: string]: string } = {};
    Object.keys(sheetRows[0]).forEach((row) => {
      const key = expectedColumns.find((column) => {
        const rowNormalized = normalizeString(String(row));
        const possibleKeys = [column.key, ...(column.variant || [])];
        return possibleKeys.some((value) => normalizeString(String(value)) === rowNormalized);
      })?.key;
      if (!key) return;
      columns[key] = row;
    });
    return { columns, hasAll: Object.keys(columns).length === expectedColumns.length };
  };

  const handleUpload = async (file: File) => {
    try {
      setErrorStep(undefined);
      setErrorMessage('');
      const data = await file.arrayBuffer();
      const workbook = readXlsx(data, { sheetStubs: true, bookDeps: true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      let values: Array<{ [k: string]: string }> = utilsXlsx.sheet_to_json(sheet, {
        defval: '',
        blankrows: false,
      });

      // Verifica se há a linha de exemplo (por exemplo, na célula da coluna 14)
      const exampleColumnArray = Array(9)
        .fill(65)
        .map((_, i) => String.fromCharCode(65 + i) + `${exampleColumnNumber + 1}`);

      const hasColumnExample = exampleColumnArray.every((cell) => sheet[cell]?.v);

      if (hasColumnExample) {
        const valuesFromColumnExample: Array<{ [k: string]: string }> = utilsXlsx.sheet_to_json(
          sheet,
          {
            range: exampleColumnNumber,
            defval: '',
            blankrows: false,
          },
        );
        const { hasAll } = verifyColumns(valuesFromColumnExample);
        if (hasAll) {
          values = valuesFromColumnExample;
        }
      }
      if (values.length === 0) {
        setErrorMessage('Arquivo selecionado não contém dados');
        return;
      } else if (Object.keys(values[0]).length < expectedColumns.length) {
        setErrorMessage('Arquivo selecionado não contém a quantidade de colunas esperadas');
        return;
      }
      values.forEach((row, indexRow) => {
        Object.keys(row).forEach((key) => {
          if (key.startsWith('_') || !key.trim()) {
            delete values[indexRow][key];
          }
        });
      });
      setRows(values);
      setCurrentStep(STEPS.VALIDATE_COLUMNS);
    } catch (err) {
      console.error(err)
      setErrorMessage('Erro ao processar o arquivo');
      setErrorStep(STEPS.UPLOAD_FILE);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangeColumnSelect = (row: string, value: string) => {
    setExpectedColumnsToRows((prev) => {
      const newValue = { ...prev };
      Object.keys(newValue).forEach((key) => {
        if (newValue[key] === row && value !== key) {
          toast.error('Essa coluna já foi selecionada');
          newValue[key] = '';
        }
      });
      newValue[value] = row;
      return newValue;
    });
  };

  const handleBack = () => {
    setErrorMessage('');
    if (currentStep === STEPS.VALIDATE_DATE) {
      setCurrentStep(STEPS.VALIDATE_COLUMNS);
    } else if (currentStep === STEPS.VALIDATE_COLUMNS) {
      setCurrentStep(STEPS.UPLOAD_FILE);
    }
  };

  const handleNextValidateColumns = async () => {
    if (currentStep === STEPS.VALIDATE_COLUMNS) {
      setCurrentStep(STEPS.VALIDATE_DATE);
    } else if (currentStep === STEPS.VALIDATE_DATE) {
      setLoading(true);
      if (!finish || !expectedColumnsToRows) {
        setLoading(false);
        toast.error('Não finalizado');
        return;
      }
      const success = await finish(rows, expectedColumnsToRows);
      setLoading(false);
      if (success) {
        handleCancel();
      }
    } else if (currentStep === STEPS.UPLOAD_FILE) {
      setBtnDisabled(true);
    }
  };

  // Efetua o mapeamento inicial das colunas esperadas
  useEffect(() => {
    const initialMapping: { [k: string]: string } = {};
    expectedColumns.forEach((column) => {
      initialMapping[column.key] = '';
    });
    setExpectedColumnsToRows(initialMapping);
  }, [expectedColumns]);

  // Validação dos mapeamentos das colunas
  useEffect(() => {
    if (currentStep !== STEPS.VALIDATE_COLUMNS) return;
    setErrorMessage('');
    const isIncomplete = expectedColumns.some(
      (column) => !expectedColumnsToRows[column.key]
    );
    if (isIncomplete) {
      setBtnDisabled(true);
      setErrorMessage('Selecione uma coluna para cada item esperado');
    } else {
      setBtnDisabled(false);
    }
  }, [expectedColumnsToRows, currentStep, expectedColumns]);

  // Quando as linhas forem carregadas, tenta mapear as colunas automaticamente
  useEffect(() => {
    const { columns } = verifyColumns(rows);
    setExpectedColumnsToRows((prev) => ({ ...prev, ...columns }));
  }, [rows]);


  const itemsSteps: {
    title: string;
    status: "wait" | "process" | "finish" | "error";
  }[] = [
    {
      title: 'Enviar Arquivo',
      status:
        errorStep === STEPS.UPLOAD_FILE
          ? 'error'
          : currentStep === STEPS.UPLOAD_FILE
            ? 'process'
            : currentStep > STEPS.UPLOAD_FILE
              ? 'finish'
              : 'wait',
    },
    {
      title: 'Validar Colunas',
      status:
        errorStep === STEPS.VALIDATE_COLUMNS
          ? 'error'
          : currentStep === STEPS.VALIDATE_COLUMNS
            ? 'process'
            : currentStep > STEPS.VALIDATE_COLUMNS
              ? 'finish'
              : 'wait',
    },
    {
      title: 'Validar Dados',
      status:
        errorStep === STEPS.VALIDATE_DATE
          ? 'error'
          : currentStep === STEPS.VALIDATE_DATE
            ? 'process'
            : currentStep > STEPS.VALIDATE_DATE
              ? 'finish'
              : 'wait',
    },
  ];

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={handleCancel}
    >
      <DialogContent
        className="max-w-[1200px] modal-import-data">
        <DialogHeader className="sr-only">
          <DialogTitle >Importar Dados</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{title}</h2>

          <ModalImportFormStepper
            currentStep={String(currentStep)}
            steps={itemsSteps.map((step) => ({
              id: step.title,
              name: step.title,
              status: step.status,
            }))}
          />

          <div className="mt-6">
            {currentStep === STEPS.UPLOAD_FILE && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-medium">Dados que esperamos</span>
                  {docExampleUrl && (
                    <Button
                      variant="default"
                      className="flex items-center gap-2"
                    >
                      <LucideDownload size={16} /> Baixar exemplo de planilha
                    </Button>
                  )}
                </div>
                <div className="flex overflow-auto gap-4 mb-4">
                  {expectedColumns.map((column) => (
                    <div
                      key={column.key}
                      className="flex flex-col items-center p-2"
                      style={{ minWidth: column.previewWidth || 200 }}
                    >
                      <span className="font-bold">{column.key}</span>
                      <span className="text-sm text-gray-500">{column.example}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Você poderá renomear ou remover colunas no próximo passo
                </p>
                <FileDropzone onFileDrop={handleUpload} isUploading={isUploading} />
              </>
            )}

            {currentStep === STEPS.VALIDATE_COLUMNS && (
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
                            value= {
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
                          {/* <option value="">Selecione uma coluna</option>
                            {expectedColumns.map((column) => (
                              <option key={column.key} value={column.key}>
                                {column.key}{' '}
                                {(expectedColumnsToRows &&
                                  column.key &&
                                  expectedColumnsToRows[column.key]) && (
                                    <Check style={{ color: 'green' }} />
                                  )}
                              </option>
                            ))}
                          </Select> 
                          */}
                          {/* <Select
                            key={JSON.stringify(expectedColumnsToRows)}
                            value={Object.keys(expectedColumnsToRows).find(
                              (key) => expectedColumnsToRows[key] === rowKey,
                            )}
                            onValueChange={(value) => handleChangeColumnSelect(rowKey, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione uma coluna" />
                            </SelectTrigger>
                            <SelectContent>
                              {expectedColumns.map((column) => (
                                <SelectItem key={column.key} value={column.key} renderCheck={false}>
                                  <div className="flex flex-row gap-2">
                                    {column.key}{' '}
                                    {(expectedColumnsToRows &&
                                      column.key &&
                                      expectedColumnsToRows[column.key]) && (
                                        <Check style={{ color: 'green' }} />
                                      )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>  */}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === STEPS.VALIDATE_DATE && (
              <div>
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
                    {rows.map((row) => (
                      <TableRow key={row[expectedColumns[0].key]}>
                        {expectedColumns.map((column) => {
                          const columnValue = expectedColumnsToRows[column.key] ? row[expectedColumnsToRows[column.key]] : ''
                          return <TableCell key={column.key}>{String(columnValue).slice(0, 50)}{String(columnValue).length > 50 && '...'}</TableCell>
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {errorMessage && <p className="text-red-600 my-4">{errorMessage}</p>}

            <div className="flex justify-between mt-6">
              <Button
                variant="default"
                onClick={handleBack}
                disabled={loading}
                className={
                  [STEPS.VALIDATE_DATE, STEPS.VALIDATE_COLUMNS].includes(currentStep)
                    ? 'flex'
                    : 'hidden'
                }
              >
                Voltar
              </Button>
              <Button
                variant="default"
                onClick={handleNextValidateColumns}
                disabled={btnDisabled || loading}
                style={{
                  display: currentStep === STEPS.VALIDATE_COLUMNS ? 'flex' : 'none'
                }}
              >
                Próximo
              </Button>
              <Button
                variant="default"
                onClick={async () => {
                  setLoading(true);
                  const success = await finish(rows, expectedColumnsToRows);
                  setLoading(false);
                  if (success) {
                    handleCancel();
                  }
                }}
                disabled={btnDisabled}
                loading={loading}
                style={{
                  display: currentStep === STEPS.VALIDATE_DATE ? 'flex' : 'none'
                }}
              >
                Importar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalImportData;
