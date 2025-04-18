"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  ChevronLeft,
  ChevronRight
} from "lucide-react";

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
      icon: <FileText size={20} />,
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
