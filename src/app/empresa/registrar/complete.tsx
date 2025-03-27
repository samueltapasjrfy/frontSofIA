'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LottieAnimation } from '@/components/ui/lottie-animation'
import Image from 'next/image'

export default function RegistrationComplete() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center bg-white p-4">
      {/* Logo no topo */}
      <div className="mb-4">
        <div className="flex items-center">
          <Image src="/images/logo.png" alt="Jurify" width={250} height={250} />
        </div>
      </div>

      <div className="max-w-md w-full flex flex-col items-center text-center">
        {/* Animação de sucesso (opcional) */}
        <div className="w-40 h-40 mb-6">
          <LottieAnimation 
            name="success" 
            height={160} 
            width={160}
            loop={false}
        />
        </div>

        {/* Título */}
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Obrigado por se registrar!
        </h1>

        {/* Mensagem */}
        <p className="text-gray-600 mb-8">
          Seu registro foi concluído com sucesso. Agora você já pode começar a usar o sistema.
        </p>

        {/* Botão */}
        <Button 
          onClick={() => router.push('/dashboard')}
          className="bg-blue-600 hover:bg-blue-700 text-white "
        >
          Começar a usar
        </Button>
      </div>
    </div>
  )
}
