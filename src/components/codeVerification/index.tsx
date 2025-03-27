import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

interface CodeVerificationProps {
    verificationCode: string;
    setVerificationCode: (code: string) => void;
    timer: number | null;
    setTimer: (timer: number) => void;
    handleRequestNewCode: () => Promise<{ isValid: boolean, milliseconds?: number }>;
    verificationLoading?: boolean;
    maxTime?: number;
}
export function CodeVerification({
    verificationCode,
    setVerificationCode,
    timer,
    setTimer,
    handleRequestNewCode,
    verificationLoading,
    maxTime = 61
}: CodeVerificationProps) {
    return (
        <div>
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
                            setTimer(isValid ? maxTime : Math.ceil(milliseconds ? (milliseconds / 1000) : maxTime));
                        }}
                        disabled={verificationLoading}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Solicitar novo código
                    </button>
                </p>
            )}
        </div>
    )
}