"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { FirmProvider } from "@/contexts/FirmContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { verifyCompany } from "@/utils/verifyCompany";
import { getLocalStorage, LocalStorageKeys, setLocalStorage } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";
import { getCookie } from "@/utils/cookie";
import { COOKIE_NAME } from "@/constants/cookies";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    // Verificar o estado da sidebar no localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setIsCollapsed(savedState === 'true');
    }

    // Adicionar um listener para detectar mudanças no localStorage
    const handleStorageChange = () => {
      const currentState = localStorage.getItem('sidebarCollapsed');
      setIsCollapsed(currentState === 'true');
    };

    window.addEventListener('storage', handleStorageChange);

    // Também podemos usar um MutationObserver para detectar mudanças no DOM
    const observer = new MutationObserver(() => {
      const currentState = localStorage.getItem('sidebarCollapsed');
      if (currentState === 'true' && !isCollapsed) {
        setIsCollapsed(true);
      } else if (currentState === 'false' && isCollapsed) {
        setIsCollapsed(false);
      }
    });

    observer.observe(document.body, { attributes: true, childList: true, subtree: true });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
    };
  }, [isCollapsed]);

  useEffect(() => {
    const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)
    const token = getCookie(COOKIE_NAME.AUTH_TOKEN)
    if (!token || !user?.user?.id) {
      window.location.href = '/login'
      return
    }
    const isCompanyVerified = verifyCompany({ registerOrgPage: false })
    if (isCompanyVerified) {
      setIsReady(true)
    }
  }, [])

  // Effect para redirecionamento baseado na versão
  useEffect(() => {
    if (!isMounted || !isReady) return;

    let version = getLocalStorage<string>(LocalStorageKeys.VERSION);
    if (!version) {
      version = '1';
      setLocalStorage(LocalStorageKeys.VERSION, version);
    }
    // Verificar se a rota atual não está em /v1 ou /v2
    const routeVersion = pathname.startsWith('/v1/') ? '1' : pathname.startsWith('/v2/') ? '2' : null;

    if (!routeVersion) {
      // Pegar a versão do localStorage

      // Extrair a página atual (remover a barra inicial se existir)
      const currentPage = pathname.startsWith('/') ? pathname.slice(1) : pathname;

      // Redirecionar para a versão correta
      const newPath = `/v${version}/${currentPage}`;
      router.replace(newPath);
      return
    }
    if (routeVersion !== version) {
      setLocalStorage(LocalStorageKeys.VERSION, routeVersion);
      window.location.reload();
    }
  }, [isMounted, isReady, pathname, router]);

  const toggleSidebar = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    localStorage.setItem('sidebarCollapsed', newValue.toString());
  };

  if (!isMounted || !isReady) {
    return null;
  }

  return (
    <FirmProvider>
      <DashboardProvider>
        <div className="flex h-screen">
          <div className="h-full z-10 flex-shrink-0">
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
          </div>
          <div className="flex-1 flex flex-col transition-all duration-300">
            <Header isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </DashboardProvider>
    </FirmProvider>
  );
}