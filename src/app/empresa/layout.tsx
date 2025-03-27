"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { logout } from "@/utils/logout";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { verifyCompany } from "@/utils/verifyCompany";
import { LoadingPage } from "@/components/loadingPage";
import { LoginResponse } from "@/api/authApi";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [pageReady, setPageReady] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)
    if (!user?.token) return router.push('/login')
    setUserName(user.user.name.split(' ')[0])

    const isCompanyVerified = verifyCompany({ registerOrgPage: true })
    if (isCompanyVerified) {
      setPageReady(true)
    }
  }, [])
  
  return (
    <>
      {pageReady ? (
        <div className="min-h-screen flex flex-col justify-between">
          {/* Header minimalista */}
          <header className="flex justify-between items-center bg-white shadow-sm p-4">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Jurify
              </Link>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User size={18} />
                  <span>{userName}</span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout} className="text-alert-red">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          {children}
          {/* Footer minimalista */}
          <footer className="bg-white p-4 border-t">
            <div className="container mx-auto text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Jurify. Todos os direitos reservados.
            </div>
          </footer>
        </div>
      ) : (
        <LoadingPage />
      )}
    </>
  )
} 