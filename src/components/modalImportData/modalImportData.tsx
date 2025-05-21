import "./modalImportData.css"
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import { read as readXlsx, utils as utilsXlsx } from 'xlsx';
import { normalizeString } from '@/utils/str';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { DialogHeader } from "../ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ModalImportFormStepper } from "./modalImportFormStepper";
import { ExpectedColumns, ImportData, ModalImportDataSteps, VerifyColumnsResponse } from "./types";
import { UploadFileStep } from "./steps/uploadFileStep";
import { ValidateColumnsStep } from "./steps/validateColumnsStep";
import { ValidateDateStep } from "./steps/validateDateStep";
import { ModalImportDataControls } from "./modalImportDataControls";

interface ModalImportDataProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  finish: (data: ImportData) => Promise<boolean>;
  docExampleUrl?: string;
  expectedColumns: ExpectedColumns[];
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
  const [currentStep, setCurrentStep] = useState(ModalImportDataSteps.UPLOAD_FILE);
  const [errorStep, setErrorStep] = useState<number | undefined>(undefined);
  const [rows, setRows] = useState<Array<{ [k: string]: string }>>([]);
  const [expectedColumnsToRows, setExpectedColumnsToRows] = useState<{ [k: string]: string }>({});

  const exampleColumnNumber = 13;

  const handleCancel = () => {
    setCurrentStep(ModalImportDataSteps.UPLOAD_FILE);
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
      setCurrentStep(ModalImportDataSteps.VALIDATE_COLUMNS);
    } catch (err) {
      console.error(err)
      setErrorMessage('Erro ao processar o arquivo');
      setErrorStep(ModalImportDataSteps.UPLOAD_FILE);
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

  const itemsSteps: {
    title: string;
    status: "wait" | "process" | "finish" | "error";
  }[] = [
      {
        title: 'Enviar Arquivo',
        status:
          errorStep === ModalImportDataSteps.UPLOAD_FILE
            ? 'error'
            : currentStep === ModalImportDataSteps.UPLOAD_FILE
              ? 'process'
              : currentStep > ModalImportDataSteps.UPLOAD_FILE
                ? 'finish'
                : 'wait',
      },
      {
        title: 'Validar Colunas',
        status:
          errorStep === ModalImportDataSteps.VALIDATE_COLUMNS
            ? 'error'
            : currentStep === ModalImportDataSteps.VALIDATE_COLUMNS
              ? 'process'
              : currentStep > ModalImportDataSteps.VALIDATE_COLUMNS
                ? 'finish'
                : 'wait',
      },
      {
        title: 'Validar Dados',
        status:
          errorStep === ModalImportDataSteps.VALIDATE_DATE
            ? 'error'
            : currentStep === ModalImportDataSteps.VALIDATE_DATE
              ? 'process'
              : currentStep > ModalImportDataSteps.VALIDATE_DATE
                ? 'finish'
                : 'wait',
      },
    ];

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
    if (currentStep !== ModalImportDataSteps.VALIDATE_COLUMNS) return;
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
            {currentStep === ModalImportDataSteps.UPLOAD_FILE && (
              <UploadFileStep
                docExampleUrl={docExampleUrl}
                expectedColumns={expectedColumns}
                handleUpload={handleUpload}
                isUploading={isUploading}
              />
            )}

            {currentStep === ModalImportDataSteps.VALIDATE_COLUMNS && (
              <ValidateColumnsStep
                rows={rows}
                expectedColumnsToRows={expectedColumnsToRows}
                expectedColumns={expectedColumns}
                handleChangeColumnSelect={handleChangeColumnSelect}
              />
            )}

            {currentStep === ModalImportDataSteps.VALIDATE_DATE && (
              <ValidateDateStep
                rows={rows}
                expectedColumnsToRows={expectedColumnsToRows}
                expectedColumns={expectedColumns}
              />
            )}

            {errorMessage && <p className="text-red-600 my-4">{errorMessage}</p>}

            <ModalImportDataControls
              btnDisabled={btnDisabled}
              loading={loading}
              setLoading={setLoading}
              currentStep={currentStep}
              finish={finish}
              handleCancel={handleCancel}
              setCurrentStep={setCurrentStep}
              setErrorMessage={setErrorMessage}
              setBtnDisabled={setBtnDisabled}
              expectedColumnsToRows={expectedColumnsToRows}
              rows={rows}
            />

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalImportData;
