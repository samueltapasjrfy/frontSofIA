"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/utils/logout";
import { useIsMobile } from "@/hooks/useMobile";
import { SidebarMobile } from "./SidebarMobile";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";
import { cn } from "@/utils/cn";
import { GetBgColor } from "./GetBgColor";

interface HeaderProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Header({ isCollapsed, toggleSidebar }: HeaderProps) {
  const [userName, setUserName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const isMobile = useIsMobile();
  const userData = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)

  useEffect(() => {
    setCompanyName(userData.companies?.[0]?.name);
    setUserName(userData.user.name.split(' ')[0]);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={cn(
      "h-16  border-b border-blue-700 flex items-center justify-between px-6 w-full flex-shrink-0",
      GetBgColor(userData.companies?.[0]?.id)
    )}>
      {isMobile ? <SidebarMobile isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} /> : <div />}
      <div className="font-semibold text-lg text-white">
        {companyName}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn(
            "flex items-center gap-2 text-white",
            GetBgColor(userData.companies?.[0]?.id, true)
          )}>
            <User size={18} />
            <span>{userName}</span>
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Perfil</DropdownMenuItem>
          <DropdownMenuItem>Configurações</DropdownMenuItem>
          <DropdownMenuSeparator /> */}
          <DropdownMenuItem onClick={handleLogout} className="text-alert-red">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
} 