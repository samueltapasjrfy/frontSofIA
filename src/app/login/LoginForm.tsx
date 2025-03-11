'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginFormSkeleton } from './LoginFormSkeleton'
import { toast } from 'sonner'
import Cookies from 'js-cookie'

interface LoginResponse {
  data: {
    token: string;
    companies: {
      id: string;
      name: string;
    }[];
  }
}

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    user: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auth/App`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data: LoginResponse = await response.json()

      if (response.ok) {
        // Salvar o token
        localStorage.setItem('token', data.data.token)
        
        // Salvar o token como cookie
        Cookies.set('auth-token', data.data.token, { 
          expires: 7, // expira em 7 dias
          path: '/' 
        })
        
        // Salvar os dados da empresa se existirem
        if (data.data.companies && data.data.companies.length > 0) {
          const company = data.data.companies[0]
          localStorage.setItem('companyName', company.name)
        }

        // Redireciona para a página anterior ou dashboard
        const from = searchParams.get('from') || '/publicacoes'
       
        router.push(from)
        router.refresh() // Força a atualização do layout
      } else {
        toast.error('Credenciais inválidas')
      }
    } catch (error) {
      console.log(error)
      toast.error('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="user" className="sr-only">
            Usuário
          </label>
          <input
            id="user"
            name="user"
            type="text"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Usuário"
            value={formData.user}
            onChange={(e) => setFormData({ ...formData, user: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Senha"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </form>
  )
}

export function LoginForm() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginFormContent />
    </Suspense>
  )
} 