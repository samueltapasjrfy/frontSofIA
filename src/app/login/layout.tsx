"use client"
import { LoginResponse } from "@/api/authApi"
import { LoadingPage } from "@/components/loadingPage"
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage"
import { verifyCompany } from "@/utils/verifyCompany"
import { AppContext } from "next/app"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"


function LoginLayout({
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

LoginLayout.getInitialProps = async (appContext: AppContext) => {
  const appProps = await (await import('next/app')).default.getInitialProps!(appContext)
  const nonce = appContext.ctx.req?.headers['x-nonce'] as string | undefined
  return { ...appProps, nonce }
}
export default LoginLayout;