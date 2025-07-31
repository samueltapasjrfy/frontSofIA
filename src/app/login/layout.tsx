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
    if (!user?.user?.id) {
      setIsReady(true)
      return
    }

    const isCompanyVerified = verifyCompany({ registerOrgPage: false })
    if (isCompanyVerified) {
      return user?.companies?.[0]?.id === '01JTNVAEYETZAJP0F4X7YQYQBR' ? router.push('/v2/publicacoes') : router.push('/v1/dashboard')
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