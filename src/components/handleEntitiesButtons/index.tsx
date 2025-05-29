import { Plus, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/utils/cn";
import { GetBgColor } from "../layout/GetBgColor";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";

type HandleEntitiesButtonsProps = {
    entityName: string;
    handleImport?: () => void;
    handleRegister?: () => void;
    otherButtons?: React.ReactNode;
}
export const HandleEntitiesButtons = ({ entityName, handleImport, handleRegister, otherButtons }: HandleEntitiesButtonsProps) => {
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
            {handleRegister && (
                <Button
                    onClick={handleRegister}
                    className={cn(
                        "text-white",
                        GetBgColor(user?.companies?.[0]?.id, true)
                    )}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar {entityName}
                </Button>
            )}
            {otherButtons}
        </div>
    );
};