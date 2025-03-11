"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Scale, 
  BookMarked, 
  Settings, 
  Menu,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMobile";

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

export function Sidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Salvar o estado de colapso no localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);
  
  // Atualizar localStorage quando o estado mudar
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

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

  const sidebarContent = (
    <div className="flex h-full flex-col gap-4 py-4 relative">
      <div className={cn("px-4 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && <h2 className="text-xl font-bold text-white">Sofia</h2>}
        {!isMobile && (
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

  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 m-2">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-primary-blue text-white w-64">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "h-full bg-primary-blue text-white flex-shrink-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {sidebarContent}
    </div>
  );
} 