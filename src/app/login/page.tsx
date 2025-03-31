"use client"
import { LoginForm } from './LoginForm'
import Image from 'next/image'
import './btngoogle.css'
import GoogleBtnScripts from './googleBtnScripts'
import { loginGoogle, LoginResponse } from '@/api/authApi'
import { PERSON_STATUS } from '@/constants/auth'
import { toast } from 'sonner'
import { LocalStorageKeys, setLocalStorage } from '@/utils/localStorage'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { setCookie } from '@/utils/cookie'
import { COOKIE_NAME } from '@/constants/cookies'
export default function LoginPage() {

  const router = useRouter()
  const searchParams = useSearchParams()
  const [unverifiedUserData, setUnverifiedUserData] = useState<LoginResponse | null>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLoginGoogle = async (token: string) => {
    const response = await loginGoogle(token)
    handleLogin(response) 
  }

  const handleLogin = async (data: LoginResponse) => {
    // Verificar se o usuário precisa confirmar o cadastro
    if (data.status.id === PERSON_STATUS.PENDING) {
      // Salvar os dados em um state em vez de no cookie
      setUnverifiedUserData(data)
      // Abrir o modal para verificação
      setShowVerificationModal(true)
      toast.info('Por favor, verifique seu cadastro inserindo o código enviado para seu email')
      setLoading(false)
      return
    }
    // Fluxo normal - usuário já verificado
    // Salvar o token como cookie
    setCookie({
      name: COOKIE_NAME.AUTH_TOKEN,
      value: data.token,
      expires: 1000 * 60 * 60 * 24 * 30 // 30 dias
    })
    // Salvar os dados da empresa se existirem
    const {token, ...localStorageData} = data
    setLocalStorage(LocalStorageKeys.USER, localStorageData)
    // Redireciona para a página anterior ou dashboard
    const from = searchParams.get('from') || '/dashboard'
    router.push(from)
    router.refresh() // Força a atualização do layout
  }
  return (
    <>
      {/* Lado esquerdo - Imagem e descrição */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 text-white flex-col items-center justify-center p-16 relative overflow-hidden">
        {/* Logo com fundo branco para melhor visibilidade */}
        <div className="flex flex-col items-center mb-12 z-10">
          <div className="bg-white rounded-xl shadow-md">
            <Image
              src="/images/logo.png"
              alt="Jurify"
              width={200}
              height={70}
              className="h-auto"
              priority
            />
          </div>
        </div>

        <div className="text-center mb-8 z-10">
          <p className="text-xl mb-2">
            Bem-vindo à plataforma <b>Sofia</b> especializada em
          </p>
          <p className="text-2xl font-bold">
            Análise Jurídica Inteligente
          </p>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center p-8 lg:p-16">
        {/* Logo visível apenas em telas mobile */}
        <div className="lg:hidden mb-8">
          <Image
            src="/images/logo.png"
            alt="Jurify"
            width={160}
            height={56}
            className="h-auto"
            priority
          />
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Acesso ao Sistema</h2>
          </div>

          <LoginForm 
            handleLogin={handleLogin}
            loading={loading}
            setLoading={setLoading}
            unverifiedUserData={unverifiedUserData}
            setUnverifiedUserData={setUnverifiedUserData}
            showVerificationModal={showVerificationModal}
            setShowVerificationModal={setShowVerificationModal}
          />

          <div className="mt-8 text-center">

            <p className="text-gray-500 mb-4">ou</p>
            <div className="flex justify-center space-x-4 box-btn-google">
            <GoogleBtnScripts onLogin={handleLoginGoogle} />
            </div>

          </div>
        </div>
      </div>
    </>
  )
} 