import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import ReactQueryProvider from '@/providers/ReactQueryProvider'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')

  // Redireciona para login se não houver token
  if (!token) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <ReactQueryProvider>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </ReactQueryProvider>
      </div>
    </div>
  )
} 