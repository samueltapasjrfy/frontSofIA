import { Upload } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/utils/cn";
import { GetBgColor } from "../layout/GetBgColor";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";

type HandleEntitiesButtonsProps = {
    entityName: string;
    handleImport?: () => void;
    handleRegister?: () => void;
    handleRemove?: () => void;
}
export const HandleEntitiesButtons = ({ entityName, handleImport, handleRegister, handleRemove }: HandleEntitiesButtonsProps) => {
    const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)

    return (
        <div className="flex gap-2">
            {handleImport && (
                <Button
                    onClick={handleImport}
                    className="bg-primary-white hover:bg-primary-white text-primary-blue border border-primary-blue"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Importar {entityName}
                </Button>
            )}
            {handleRemove && (
                <Button
                    onClick={handleRemove}
                    className={cn(
                        "text-red-500 hover:text-white hover:bg-red-500 border-red-500",
                    )}
                    variant="outline"
                    type="button"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Remover {entityName}
                </Button>
            )}
            {handleRegister && (
                <Button
                    onClick={handleRegister}
                    className={cn(
                        "text-white",
                        GetBgColor(user?.companies?.[0]?.id, true)
                    )}
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Registrar {entityName}
                </Button>
            )}

        </div>
    );
};