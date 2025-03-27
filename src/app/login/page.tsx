import { LoginForm } from './LoginForm'
import Image from 'next/image'

export default function LoginPage() {
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
          
          <LoginForm />
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 mb-4">ou acesse com</p>
            <div className="flex justify-center space-x-4">
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <Image src="/icons/google.png" alt="Google" width={32} height={32} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 