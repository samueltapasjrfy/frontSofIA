"use client";

import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { FirmProvider } from "@/contexts/FirmContext";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
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

  if (!isMounted) {
    return null;
  }

  return (
    <FirmProvider>
      <DashboardProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <div className="fixed h-full z-10">
            <Sidebar />
          </div>
          <div
            className={`transition-all duration-300 flex-1 overflow-hidden flex flex-col ${isCollapsed ? "ml-16" : "ml-64"
              }`}
          >
            <Header />
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </DashboardProvider>
    </FirmProvider>
  );
} 