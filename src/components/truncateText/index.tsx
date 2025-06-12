import { ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

type TruncateTextProps = {
    text: string;
    maxLength: number;
    onClick: (text: string) => void
}
export const TruncateText = ({ text, maxLength, onClick }: TruncateTextProps) => {
    if (!text || text.length <= maxLength) return text || "";
    return (
        <div className="flex justify-between gap-2">
            <span className="line-clamp-2">{text.substring(0, maxLength)}...</span>
            <Button
                variant="ghost"
                size="sm"
                className="text-primary-blue font-medium hover:bg-blue-50 p-1 h-auto"
                onClick={() => onClick(text)}
            >
                <span className="sr-only">Ver mais</span>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
};