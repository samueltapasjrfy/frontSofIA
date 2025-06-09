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
import { getLocalStorage, LocalStorageKeys, setLocalStorage } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";
import { cn } from "@/utils/cn";
import { GetBgColor } from "./GetBgColor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface HeaderProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Header({ isCollapsed, toggleSidebar }: HeaderProps) {
  const [userName, setUserName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [version, setVersion] = useState<string>(getLocalStorage(LocalStorageKeys.VERSION) || "1");
  const isMobile = useIsMobile();
  const userData = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)

  useEffect(() => {
    setCompanyName(userData.companies?.[0]?.name);
    setUserName(userData.user.name.split(' ')[0]);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleVersionChange = (value: string) => {
    setVersion(value);
    setLocalStorage(LocalStorageKeys.VERSION, value);
    const link = value === '1' ? '/v1/dashboard' : '/v2/publicacoes'
    window.location.href = link;
  }

  return (
    <header className={cn(
      "h-16  border-b border-blue-700 flex items-center justify-between px-6 w-full flex-shrink-0",
      GetBgColor(userData.companies?.[0]?.id)
    )}>
      {isMobile ? <SidebarMobile isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} /> : <></>}
      <div className="font-semibold text-white flex items-center gap-2">
        <span className="text-lg">Sofia</span>
        <span className="text-sm">|</span>
        <span className="text-sm">{companyName}</span>
      </div>

      <div className="flex items-center gap-2">
        <span>
          <Select value={version} onValueChange={handleVersionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a versão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">V1</SelectItem>
              <SelectItem value="2">V2</SelectItem>
            </SelectContent>
          </Select>
        </span>
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
      </div>
    </header>
  );
} 