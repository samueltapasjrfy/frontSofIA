"use client";

import { ReactNode, useEffect, useState } from "react";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { FirmProvider } from "@/contexts/FirmContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { verifyCompany } from "@/utils/verifyCompany";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    if (!user?.token) {
      window.location.href = '/login'
      return
    }
    const isCompanyVerified = verifyCompany({ registerOrgPage: false })
    if (isCompanyVerified) {
      setIsReady(true)
    }
  }, [])

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