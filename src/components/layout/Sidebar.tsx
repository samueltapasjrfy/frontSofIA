"use client";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMobile";
import { SidebarContent } from "./SidebarContent";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const isMobile = useIsMobile();

  // Não renderizar a sidebar em dispositivos móveis
  if (isMobile) return null;

  return (
    <div 
      className={cn(
        "h-screen bg-primary-blue text-white flex-shrink-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
    </div>
  );
} 