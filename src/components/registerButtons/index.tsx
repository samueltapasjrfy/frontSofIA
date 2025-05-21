import { Upload } from "lucide-react";
import { Button } from "../ui/button";

type RegisterButtonsProps = {
    handleImportClick?: () => Promise<void>;
    handleRegisterClick?: () => void;
    labelImport?: string;
    labelRegister?: string;
};

export const RegisterButtons = ({ handleImportClick, handleRegisterClick, labelImport, labelRegister }: RegisterButtonsProps) => {
    return (
        <div className="flex gap-2">
            {handleImportClick && (
                <Button
                    onClick={handleImportClick}
                    className="bg-primary-white hover:bg-primary-white text-primary-blue border border-primary-blue"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    {labelImport || "Importar"}
                </Button>
            )}
            {handleRegisterClick && (
                <Button
                    onClick={handleRegisterClick}
                    className="bg-primary-blue hover:bg-blue-700 text-white"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    {labelRegister || "Registrar"}
                </Button>
            )}
        </div>
    );
};