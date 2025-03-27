'use client'

import { Suspense, useState } from 'react'
import { LoginFormSkeleton } from './LoginFormSkeleton'
import { toast } from 'sonner'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { InputIcon } from '@/components/ui/input-icon'
import { User, Lock, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PasswordStrength } from '@/components/passwordStrength'
import { z } from 'zod'
import { requestVerification, confirmVerification, LoginResponse, loginUser, registerUser } from '@/api/authApi'
import { VerificationModal } from './VerificationModal'
import { RecoverPasswordModal } from './RecoverPasswordModal'
import { PERSON_STATUS } from '@/constants/auth'

type Tab = 'login' | 'register'

// Schema de validação do formulário de registro
const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Por favor, insira um email válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
})

type RegisterSchema = z.infer<typeof registerSchema>

type LoginFormProps = {
  handleLogin: (data: LoginResponse) => Promise<void>
  loading: boolean
  setLoading: (loading: boolean) => void
  unverifiedUserData: LoginResponse | null
  setUnverifiedUserData: (unverifiedUserData: LoginResponse | null) => void
  showVerificationModal: boolean
  setShowVerificationModal: (showVerificationModal: boolean) => void
}
function LoginFormContent({
  handleLogin,
  loading,
  setLoading,
  unverifiedUserData,
  setUnverifiedUserData,
  showVerificationModal,
  setShowVerificationModal
}: LoginFormProps) {
  const [activeTab, setActiveTab] = useState<Tab>('login')
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof RegisterSchema, string>>>({})

  // Novos states para o modal de verificação
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationLoading, setVerificationLoading] = useState(false)

  // State para o modal de recuperação de senha
  const [showRecoverPasswordModal, setShowRecoverPasswordModal] = useState(false)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginUser(loginData.email, loginData.password)
      if (!data || !data?.token) throw new Error('Usuário ou senha inválidos')
      await handleLogin(data)
    } catch (error: any) {
      setLoading(false)
      toast.error(error?.message || 'Erro ao fazer login')
    }
  }

  const handleVerificationSubmit = async () => {
    if (!unverifiedUserData || !verificationCode || verificationCode.length !== 6) {
      toast.error('Por favor, insira o código de 6 dígitos')
      return
    }

    setVerificationLoading(true)

    try {
      // Chamar a função para confirmar o código de verificação
      await confirmVerification(
        unverifiedUserData.token,
        verificationCode
      )

      // Fechar o modal
      setShowVerificationModal(false)
      toast.success('Verificação concluída com sucesso!')

      const userData: LoginResponse = {
        token: unverifiedUserData.token,
        user: unverifiedUserData.user,
        status: {
          id: PERSON_STATUS.ACTIVE,
          status: 'Ativo'
        },
        companies: unverifiedUserData.companies
      }
      await handleLogin(userData)
    } catch {
      toast.error('Código de verificação inválido')
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleRequestNewCode = async (): Promise<{ message?: string, milliseconds?: number, isValid: boolean }> => {
    if (!unverifiedUserData) {
      toast.error('Erro ao solicitar novo código. Atualize a página e tente novamente.')
      return { isValid: false };
    }

    setVerificationLoading(true)

    try {
      // Chamar a função para solicitar um novo código
      const { isValid, milliseconds, message } = await requestVerification(unverifiedUserData.token)
      toast[isValid ? 'success' : 'error'](message)
      return { isValid, milliseconds, message };
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao solicitar novo código')
    } finally {
      setVerificationLoading(false)
    }
    return { message: 'Código enviado com sucesso', isValid: true, milliseconds: 60 };
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setValidationErrors({})

    // Validação com Zod
    const result = registerSchema.safeParse(registerData)

    if (!result.success) {
      // Formatando os erros para exibição
      const formattedErrors: Partial<Record<keyof RegisterSchema, string>> = {}

      result.error.errors.forEach(error => {
        const path = error.path[0] as keyof RegisterSchema
        formattedErrors[path] = error.message
      })

      setValidationErrors(formattedErrors)
      return
    }

    setLoading(true)

    try {
      // Aqui você implementaria a integração com a API de registro
      const data = await registerUser(registerData.email, registerData.password, registerData.name)
      toast.success('Conta criada com sucesso! Informe o código de verificação enviado para seu email.')
      setActiveTab('login')
      setLoading(false)
      setRegisterData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
      setUnverifiedUserData({
        token: data.token,
        user: {
          id: data.id,
          name: data.name,
        },
        status: {
          id: PERSON_STATUS.PENDING,
          status: 'Pendente',
        },
        companies: [],
      })
      setShowVerificationModal(true)

    } catch (error: any) {
      setLoading(false)
      toast.error(error?.message || 'Erro ao criar conta')
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleOpenRecoverPassword = () => {
    setShowRecoverPasswordModal(true)
  }

  return (
    <div>
      {/* Abas de navegação */}
      <div className="flex border-b mb-6">
        <button
          type="button"
          className={cn(
            "flex-1 py-3 font-medium text-sm relative",
            activeTab === 'login'
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          )}
          onClick={() => setActiveTab('login')}
        >
          Entrar
          {activeTab === 'login' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 py-3 font-medium text-sm relative",
            activeTab === 'register'
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          )}
          onClick={() => setActiveTab('register')}
        >
          Registrar
          {activeTab === 'register' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
          )}
        </button>
      </div>

      {/* Formulário de Login */}
      {activeTab === 'login' && (
        <form onSubmit={handleLoginSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <InputIcon
                id="user"
                name="user"
                type="text"
                required
                leftIcon={<User size={16} className="text-gray-400" />}
                inputSize="medium"
                placeholder="Digite seu email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                Senha
              </label>
              <InputIcon
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                leftIcon={<Lock size={16} className="text-gray-400" />}
                rightIcon={showPassword ? <FaEyeSlash size={16} className="text-gray-400" /> : <FaEye size={16} className="text-gray-400" />}
                inputSize="medium"
                placeholder="Digite sua senha"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="bg-gray-50"
                onRightIconClick={togglePasswordVisibility}
              />
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={handleOpenRecoverPassword}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center mt-4">{error}</div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      )}

      {/* Formulário de Registro */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegisterSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
                Nome
              </label>
              <InputIcon
                id="name"
                name="name"
                type="text"
                required
                leftIcon={<User size={16} className="text-gray-400" />}
                inputSize="medium"
                placeholder="Digite seu nome completo"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                className={cn("bg-gray-50", validationErrors.name && "border-red-500 focus-visible:ring-red-300")}
              />
              {validationErrors.name && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <InputIcon
                id="email"
                name="email"
                type="email"
                required
                leftIcon={<Mail size={16} className="text-gray-400" />}
                inputSize="medium"
                placeholder="Digite seu email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className={cn("bg-gray-50", validationErrors.email && "border-red-500 focus-visible:ring-red-300")}
              />
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-600 mb-1">
                Senha
              </label>
              <InputIcon
                id="registerPassword"
                name="registerPassword"
                type={showPassword ? "text" : "password"}
                required
                leftIcon={<Lock size={16} className="text-gray-400" />}
                rightIcon={showPassword ? <FaEyeSlash size={16} className="text-gray-400" /> : <FaEye size={16} className="text-gray-400" />}
                inputSize="medium"
                placeholder="Crie uma senha forte"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                className={cn("bg-gray-50", validationErrors.password && "border-red-500 focus-visible:ring-red-300")}
                onRightIconClick={togglePasswordVisibility}
              />
              {registerData.password && (
                <PasswordStrength password={registerData.password} className="mt-2" />
              )}
              {validationErrors.password && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">
                Confirmar Senha
              </label>
              <InputIcon
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                leftIcon={<Lock size={16} className="text-gray-400" />}
                rightIcon={showConfirmPassword ? <FaEyeSlash size={16} className="text-gray-400" /> : <FaEye size={16} className="text-gray-400" />}
                inputSize="medium"
                placeholder="Confirme sua senha"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                className={cn("bg-gray-50", validationErrors.confirmPassword && "border-red-500 focus-visible:ring-red-300")}
                onRightIconClick={toggleConfirmPasswordVisibility}
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center mt-4">{error}</div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processando...' : 'Criar Conta'}
            </button>
          </div>
        </form>
      )}

      {/* Modal de Verificação */}
      <VerificationModal
        showVerificationModal={showVerificationModal}
        setShowVerificationModal={setShowVerificationModal}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        verificationLoading={verificationLoading}
        handleRequestNewCode={handleRequestNewCode}
        handleVerificationSubmit={handleVerificationSubmit}
      />

      {/* Modal de Recuperação de Senha */}
      <RecoverPasswordModal
        open={showRecoverPasswordModal}
        onOpenChange={setShowRecoverPasswordModal}
        initialEmail={loginData.email}
      />
    </div>
  )
}

export function LoginForm(props: LoginFormProps) {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginFormContent {...props} />
    </Suspense>
  )
} 