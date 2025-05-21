import { toast } from "sonner";
import { Button } from "../ui/button";
import { ImportData, ModalImportDataSteps } from "./types";

type ModalImportDataControlsProps = {
    btnDisabled: boolean;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    currentStep: ModalImportDataSteps;
    finish: (data: ImportData) => Promise<boolean>;
    rows: ImportData['rows'];
    expectedColumnsToRows: ImportData['expectedColumnsToRows'];
    handleCancel: () => void;
    setCurrentStep: (step: ModalImportDataSteps) => void;
    setErrorMessage: (errorMessage: string) => void;
    setBtnDisabled: (btnDisabled: boolean) => void;
}

export const ModalImportDataControls = ({
    btnDisabled,
    loading,
    setLoading,
    currentStep,
    finish,
    rows,
    expectedColumnsToRows,
    handleCancel,
    setCurrentStep,
    setErrorMessage,
    setBtnDisabled,
}: ModalImportDataControlsProps) => {
    const handleBack = () => {
        setErrorMessage('');
        if (currentStep === ModalImportDataSteps.VALIDATE_DATE) {
            setCurrentStep(ModalImportDataSteps.VALIDATE_COLUMNS);
        } else if (currentStep === ModalImportDataSteps.VALIDATE_COLUMNS) {
            setCurrentStep(ModalImportDataSteps.UPLOAD_FILE);
        }
    };

    const handleNextValidateColumns = async () => {
        if (currentStep === ModalImportDataSteps.VALIDATE_COLUMNS) {
            setCurrentStep(ModalImportDataSteps.VALIDATE_DATE);
        } else if (currentStep === ModalImportDataSteps.VALIDATE_DATE) {
            setLoading(true);

            if (!finish || !expectedColumnsToRows) {
                setLoading(false);
                toast.error('Não finalizado');
                return;
            }

            const success = await finish({ rows, expectedColumnsToRows });
            setLoading(false);
            if (success) {
                handleCancel();
            }
        } else if (currentStep === ModalImportDataSteps.UPLOAD_FILE) {
            setBtnDisabled(true);
        }
    };

    const handleImport = async () => {
        setLoading(true);
        const success = await finish({ rows, expectedColumnsToRows });
        setLoading(false);
        if (success) {
            handleCancel();
        }
    }

    return (
        <div className="flex justify-between mt-6">
            <Button
                variant="default"
                onClick={handleBack}
                disabled={loading}
                className={
                    [ModalImportDataSteps.VALIDATE_DATE, ModalImportDataSteps.VALIDATE_COLUMNS].includes(currentStep)
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
                    display: currentStep === ModalImportDataSteps.VALIDATE_COLUMNS ? 'flex' : 'none'
                }}
            >
                Próximo
            </Button>
            <Button
                variant="default"
                onClick={handleImport}
                disabled={btnDisabled}
                loading={loading}
                style={{
                    display: currentStep === ModalImportDataSteps.VALIDATE_DATE ? 'flex' : 'none'
                }}
            >
                Importar
            </Button>
        </div>
    )
}