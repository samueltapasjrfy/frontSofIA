'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InputIcon } from '@/components/ui/input-icon'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Mail, Lock } from 'lucide-react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import { CodeVerification } from '@/components/codeVerification'
import { PasswordStrength } from '@/components/passwordStrength'
import { requestPasswordReset, verifyPasswordResetCode, resetPassword } from '@/api/authApi'

// Esquema de validação para a senha
const passwordSchema = z.object({
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword']
})

type PasswordSchema = z.infer<typeof passwordSchema>

type Step = 'request' | 'verification' | 'new-password'

interface RecoverPasswordModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialEmail?: string
}

export function RecoverPasswordModal({
    open,
    onOpenChange,
    initialEmail = ''
}: RecoverPasswordModalProps) {
    const [step, setStep] = useState<Step>('request')
    const [email, setEmail] = useState(initialEmail)
    const [verificationCode, setVerificationCode] = useState('')
    const [timer, setTimer] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof PasswordSchema, string>>>({})

    // Reset state when modal opens/closes
    useEffect(() => {
        if (open) {
            setEmail(initialEmail)
            setStep('request')
        } else {
            setVerificationCode('')
            setPasswordData({
                password: '',
                confirmPassword: ''
            })
            setValidationErrors({})
        }
    }, [open, initialEmail])

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

    const handleRequestCode = async (): Promise<{ message?: string, milliseconds?: number, isValid: boolean }> => {
        if (!email.trim()) {
            toast.error('Por favor, informe um email válido')
            return { isValid: false }
        }

        setLoading(true)
        try {
            const { isValid, milliseconds, message } = await requestPasswordReset(email)

            if (!isValid && (milliseconds === undefined || milliseconds === null)) throw new Error(message)
            else if (!isValid) {
                setTimer(Math.ceil((milliseconds || 60000) / 1000))
            }
            toast[isValid ? 'success' : 'error'](message)
            setStep('verification')
            return { isValid, milliseconds, message };
        } catch (error: any) {
            toast.error(error?.message || 'Erro ao solicitar código de recuperação')
            return { isValid: false }
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyCode = async () => {
        if (verificationCode.length !== 6) {
            toast.error('Por favor, informe o código de 6 dígitos')
            return
        }

        setLoading(true)
        try {
            const result = await verifyPasswordResetCode(email, verificationCode)
            if (result.isValid) {
                setStep('new-password')
            }
        } catch (error: any) {
            toast.error(error?.message || 'Código de verificação inválido')
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async () => {
        setValidationErrors({})

        // Validação com Zod
        const result = passwordSchema.safeParse(passwordData)

        if (!result.success) {
            // Formatando os erros para exibição
            const formattedErrors: Partial<Record<keyof PasswordSchema, string>> = {}

            result.error.errors.forEach(error => {
                const path = error.path[0] as keyof PasswordSchema
                formattedErrors[path] = error.message
            })

            setValidationErrors(formattedErrors)
            return
        }

        setLoading(true)
        try {
            const result = await resetPassword(email, verificationCode, passwordData.password)
            if (result.isValid) {
                toast.success(result.message || 'Senha alterada com sucesso!')
                onOpenChange(false) // Fecha o modal
            }
        } catch (error: any) {
            toast.error(error?.message || 'Erro ao alterar a senha')
        } finally {
            setLoading(false)
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'request' && 'Recuperar Senha'}
                        {step === 'verification' && 'Verificação de Código'}
                        {step === 'new-password' && 'Definir Nova Senha'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'request' && 'Informe seu email para receber um código de recuperação.'}
                        {step === 'verification' && 'Digite o código de verificação de 6 dígitos enviado para seu email.'}
                        {step === 'new-password' && 'Crie uma nova senha para sua conta.'}
                    </DialogDescription>
                </DialogHeader>

                {step === 'request' && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-recover" className="block text-sm font-medium text-gray-600 mb-1">
                                Email
                            </label>
                            <InputIcon
                                id="email-recover"
                                name="email"
                                type="email"
                                required
                                leftIcon={<Mail size={16} className="text-gray-400" />}
                                inputSize="medium"
                                placeholder="Digite seu email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-50"
                            />
                        </div>
                    </div>
                )}

                {step === 'verification' && (
                    <CodeVerification
                        verificationCode={verificationCode}
                        setVerificationCode={setVerificationCode}
                        timer={timer}
                        setTimer={setTimer}
                        maxTime={61}
                        handleRequestNewCode={handleRequestCode}
                        verificationLoading={loading}
                    />
                )}

                {step === 'new-password' && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-600 mb-1">
                                Nova Senha
                            </label>
                            <InputIcon
                                id="new-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                leftIcon={<Lock size={16} className="text-gray-400" />}
                                rightIcon={showPassword ? <FaEyeSlash size={16} className="text-gray-400" /> : <FaEye size={16} className="text-gray-400" />}
                                inputSize="medium"
                                placeholder="Crie uma senha forte"
                                value={passwordData.password}
                                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                className={cn("bg-gray-50", validationErrors.password && "border-red-500 focus-visible:ring-red-300")}
                                onRightIconClick={togglePasswordVisibility}
                            />
                            {passwordData.password && (
                                <PasswordStrength password={passwordData.password} className="mt-2" />
                            )}
                            {validationErrors.password && (
                                <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-600 mb-1">
                                Confirmar Nova Senha
                            </label>
                            <InputIcon
                                id="confirm-new-password"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                leftIcon={<Lock size={16} className="text-gray-400" />}
                                rightIcon={showConfirmPassword ? <FaEyeSlash size={16} className="text-gray-400" /> : <FaEye size={16} className="text-gray-400" />}
                                inputSize="medium"
                                placeholder="Confirme sua senha"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className={cn("bg-gray-50", validationErrors.confirmPassword && "border-red-500 focus-visible:ring-red-300")}
                                onRightIconClick={toggleConfirmPasswordVisibility}
                            />
                            {validationErrors.confirmPassword && (
                                <p className="mt-1 text-xs text-red-500">{validationErrors.confirmPassword}</p>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    {step === 'request' && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="w-full sm:w-auto"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleRequestCode}
                                disabled={loading || !email.trim()}
                                className="w-full sm:w-auto"
                            >
                                {loading ? 'Enviando...' : 'Solicitar Código'}
                            </Button>
                        </>
                    )}

                    {step === 'verification' && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setStep('request')}
                                className="w-full sm:w-auto"
                            >
                                Voltar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleVerifyCode}
                                disabled={loading || verificationCode.length !== 6}
                                className="w-full sm:w-auto"
                            >
                                {loading ? 'Verificando...' : 'Verificar'}
                            </Button>
                        </>
                    )}

                    {step === 'new-password' && (
                        <>
                            <Button
                                type="button"
                                onClick={handleResetPassword}
                                disabled={loading || !passwordData.password || !passwordData.confirmPassword}
                                className="w-full sm:w-auto"
                            >
                                {loading ? 'Processando...' : 'Confirmar'}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
