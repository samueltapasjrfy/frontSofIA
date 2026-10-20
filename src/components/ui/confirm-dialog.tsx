"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type ConfirmDialogProps = {
    open: boolean;
    title?: string;
    description: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    showCancel?: boolean;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
};

export function ConfirmDialog({
    open,
    title = "Confirmar",
    description,
    confirmLabel = "Continuar",
    cancelLabel = "Cancelar",
    showCancel = true,
    onConfirm,
    onOpenChange,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-800">{title}</DialogTitle>
                    <DialogDescription className="pt-2 text-sm text-gray-600">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    {showCancel && (
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            {cancelLabel}
                        </Button>
                    )}
                    <Button onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
