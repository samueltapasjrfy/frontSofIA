"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  ChevronLeft,
  ChevronRight,
  Scale,
  Webhook
} from "lucide-react";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}

function SidebarItem({ icon, label, href, isActive, isCollapsed }: SidebarItemProps) {
  return (
    <Link href={href} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 px-2 text-white bg-primary-blue",
          isActive
            ? "bg-white/20"
            : "hover:bg-white/10",
          isCollapsed && "justify-center p-2"
        )}
      >
        {icon}
        {!isCollapsed && <span>{label}</span>}
      </Button>
    </Link>
  );
}

interface SidebarContentProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  showToggleButton?: boolean;
}

export function SidebarContent({
  isCollapsed,
  toggleSidebar,
  showToggleButton = true
}: SidebarContentProps) {
  const pathname = usePathname();
  const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)
  //temp
  const processCompanyHabilitados = ['01JDSEG2G5PQ1GCX86K3BV8EKR', '01JTNVAEYETZAJP0F4X7YQYQBR', '01J99YK3X66J2T2A7W9V533TM1'].includes(user?.companies?.[0]?.id)

  const sidebarItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <FileText size={20} />,
      label: "Publicações",
      href: "/publicacoes",
    },
    {
      icon: <Webhook size={20} />,
      label: "Webhooks",
      href: "/webhooks",
    },
    // {
    //   icon: <BookOpen size={20} />,
    //   label: "Artigos",
    //   href: "/artigos",
    // },
    // {
    //   icon: <Scale size={20} />,
    //   label: "Citações",
    //   href: "/citacoes",
    // },
    // {
    //   icon: <BookMarked size={20} />,
    //   label: "Biblioteca",
    //   href: "/biblioteca",
    // },
    // {
    //   icon: <Settings size={20} />,
    //   label: "Configurações",
    //   href: "/configuracoes",
    // },
  ];
  if (processCompanyHabilitados) {
    sidebarItems.splice(2, 0, {
      icon: <Scale size={20} />,
      label: "Processos",
      href: "/processos",
    })
  }
  return (
    <div className="flex h-full flex-col gap-4 py-4 relative">
      <div className={cn("px-4 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && <h2 className="text-xl font-bold text-white">Sofia</h2>}
        {showToggleButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-white hover:bg-white/10"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-1 px-2">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={pathname === item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  );
}
