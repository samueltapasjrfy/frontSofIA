"use client";

import { useState, useEffect } from "react";
import { useFirm } from "@/contexts/FirmContext";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function Header() {
  const { firmData } = useFirm();
  const router = useRouter();
  const [userName] = useState("Usuário"); // Isso seria obtido do contexto de autenticação
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const savedCompanyName = localStorage.getItem('companyName');
    if (savedCompanyName) {
      setCompanyName(savedCompanyName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('companyName');
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-blue-700 bg-sidebar flex items-center justify-between px-6">
      <div className="w-48"></div>
      
      <div className="font-semibold text-lg absolute left-1/2 transform -translate-x-1/2 text-white">
        {companyName}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-blue-700">
            <User size={18} />
            <span>{userName}</span>
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Perfil</DropdownMenuItem>
          <DropdownMenuItem>Configurações</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-alert-red">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
} 