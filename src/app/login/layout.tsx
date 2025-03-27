"use client"
import { LoginResponse } from "@/api/authApi"
import { LoadingPage } from "@/components/loadingPage"
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage"
import { verifyCompany } from "@/utils/verifyCompany"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)
    if (!user?.token) {
      setIsReady(true)
      return
    }

    const isCompanyVerified = verifyCompany({ registerOrgPage: false })
    if (isCompanyVerified) {
      return router.push('/dashboard')
    }
    router.push('/empresa/registrar')
  }, [])
  return (
    <>
      {isReady ? (
        <div className="min-h-screen flex">
          {children}
        </div>
      ) : (
        <LoadingPage />
      )
      }
    </>
  )
} 