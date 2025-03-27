import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react';
import { CodeVerification } from '@/components/codeVerification';

interface VerificationModalProps {
    showVerificationModal: boolean;
    setShowVerificationModal: (show: boolean) => void;
    verificationCode: string;
    setVerificationCode: (code: string) => void;
    verificationLoading: boolean;
    handleRequestNewCode: () => Promise<{ message?: string, milliseconds?: number, isValid: boolean }>;
    handleVerificationSubmit: () => void;
}

export function VerificationModal({
    showVerificationModal,
    setShowVerificationModal,
    verificationCode,
    setVerificationCode,
    verificationLoading,
    handleRequestNewCode,
    handleVerificationSubmit,
}: VerificationModalProps) {
    const [timer, setTimer] = useState<number | null>(null);

    useEffect(() => {
        if (timer) {
            const interval = setInterval(() => {
                if (timer <= 0) {
                    setTimer(null);
                    return;
                }
                setTimer(timer - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    useEffect(() => {
        if (showVerificationModal) {
            setVerificationCode('');
        }
    }, [showVerificationModal]);

    return (
        <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Verificação de Conta</DialogTitle>
                    <DialogDescription>
                        Digite o código de verificação de 6 dígitos enviado para seu email.
                    </DialogDescription>
                </DialogHeader>

                <CodeVerification
                    verificationCode={verificationCode}
                    setVerificationCode={setVerificationCode}
                    timer={timer}
                    setTimer={setTimer}
                    maxTime={61}
                    handleRequestNewCode={handleRequestNewCode}
                    verificationLoading={verificationLoading}
                />

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => setShowVerificationModal(false)}
                        className="w-full sm:w-auto"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleVerificationSubmit}
                        disabled={verificationLoading || verificationCode.length !== 6}
                        className="w-full sm:w-auto"
                    >
                        {verificationLoading ? 'Verificando...' : 'Verificar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}