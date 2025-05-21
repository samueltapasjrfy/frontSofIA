"use client";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMobile";
import { SidebarContent } from "./SidebarContent";
import { GetBgColor } from "./GetBgColor";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const isMobile = useIsMobile();

  // Não renderizar a sidebar em dispositivos móveis
  if (isMobile) return null;
  const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)

  return (
    <div
      className={cn(
        "h-screen text-white flex-shrink-0 transition-all duration-300",
        GetBgColor(user?.companies?.[0]?.id),
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
    </div>
  );
} 