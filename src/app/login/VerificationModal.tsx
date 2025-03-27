import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useEffect, useState } from 'react';

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

                <div className="flex justify-center my-6">
                    <InputOTP
                        maxLength={6}
                        value={verificationCode}
                        onChange={setVerificationCode}
                        pattern="^[0-9]+$"
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                {timer ? <>
                    <p className="text-center text-sm text-gray-500">
                        Aguarde <b>{timer}</b> segundos para solicitar um novo código
                    </p>
                </> : (
                    <p className="text-center text-sm text-gray-500">
                        Não recebeu um código?{" "}
                        <button
                            onClick={async () => {
                                const { isValid, milliseconds } = await handleRequestNewCode()
                                setTimer(isValid ? 61 : Math.ceil((milliseconds || 61) / 1000));
                            }}
                            disabled={verificationLoading}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Solicitar novo código
                        </button>
                    </p>
                )}

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