"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  ChevronLeft,
  ChevronRight,
  Scale,
  Webhook,
  FileCheck2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";
import { GetBgColor } from "./GetBgColor";
import { useAudiences } from "@/hooks/useAudiences";
import { useCitations } from "@/hooks/useCitations";

interface SidebarSubItem {
  label: string;
  href: string;
  amount?: number;
}

interface SidebarItemData {
  icon: React.ReactNode;
  label: string;
  href?: string;
  items?: SidebarSubItem[];
  amount?: number;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  items?: SidebarSubItem[];
  amount?: number;
  isActive?: boolean;
  isCollapsed?: boolean;
  idCompany: string;
}

function SidebarItem({ icon, label, href, items, amount, isActive, isCollapsed, idCompany }: SidebarItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  // Check if any subitem is active
  const hasActiveSubItem = items?.some(item => pathname === item.href) || false;
  const isItemActive = isActive || hasActiveSubItem;

  if (items && items.length > 0) {
    return (
      <div className="w-full">
        <Button
          variant="ghost"
          onClick={() => !isCollapsed && setIsExpanded(!isExpanded)}
          className={cn(
            "w-full justify-start gap-2 px-2 text-white",
            GetBgColor(idCompany),
            isItemActive
              ? "bg-white/20"
              : "hover:bg-white/10",
            isCollapsed && "justify-center p-2"
          )}
        >
          {icon}
          {!isCollapsed && (
            <>
              <span>{label}</span>
              {amount !== undefined && amount > 0 && (
                <span className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {amount > 99 ? '99+' : amount}
                </span>
              )}
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </>
          )}
        </Button>
        {!isCollapsed && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {items.map((subItem) => (
              <Link key={subItem.href} href={subItem.href} className="w-full">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 px-2 text-white text-sm",
                    GetBgColor(idCompany),
                    pathname === subItem.href
                      ? "bg-white/20"
                      : "hover:bg-white/10"
                  )}
                >
                  <span>{subItem.label}</span>
                  {subItem.amount !== undefined && subItem.amount > 0 && (
                    <span className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                      {subItem.amount > 99 ? '99+' : subItem.amount}
                    </span>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={href || "#"} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 px-2 text-white",
          GetBgColor(idCompany),
          isActive
            ? "bg-white/20"
            : "hover:bg-white/10",
          isCollapsed && "justify-center p-2"
        )}
      >
        {icon}
        {!isCollapsed && (
          <>
            <span>{label}</span>
            {amount !== undefined && amount > 0 && (
              <span className="ml-auto bg-white/20 text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                {amount > 99 ? '99+' : amount}
              </span>
            )}
          </>
        )}
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
  const version = user?.companies?.[0]?.id !== '01JTNVAEYETZAJP0F4X7YQYQBR' ? getLocalStorage(LocalStorageKeys.VERSION) : '2';
  //temp
  const processCompanyHabilitados = [
    '01JDSEG2G5PQ1GCX86K3BV8EKR',
    '01JTNVAEYETZAJP0F4X7YQYQBR',
    '01J99YK3X66J2T2A7W9V533TM1',
    '01K5YH62H49JKX4S18Z9B4AZKB'
  ].includes(user?.companies?.[0]?.id)
  const sentiusHabilitados = ['01JTNVAEYETZAJP0F4X7YQYQBR'].includes(user?.companies?.[0]?.id)

  // Get pending audiences count
  const { getTotalPendingQuery } = useAudiences();
  const { getTotalPendingQuery: getTotalPendingQueryCitations } = useCitations();
  const pendingAudiencesCount = getTotalPendingQuery.data?.total || 0;
  const pendingCitationsCount = getTotalPendingQueryCitations.data?.total || 0;

  const sidebarItemsV1: SidebarItemData[] = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      href: "/v1/dashboard",
    },
    {
      icon: <FileText size={20} />,
      label: "Publicações",
      href: "/v1/publicacoes",
    },
    {
      icon: <Webhook size={20} />,
      label: "Webhooks",
      href: "/v1/webhooks",
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
  const sidebarItemsV2: SidebarItemData[] = [
    // {
    //   icon: <LayoutDashboard size={20} />,
    //   label: "Dashboard",
    //   href: "/v2/dashboard",
    // },
    {
      icon: <FileText size={20} />,
      label: "Publicações",
      href: "/v2/publicacoes",
    },
    // {
    //   icon: <Webhook size={20} />,
    //   label: "Webhooks",
    //   href: "/v2/webhooks",
    // },

  ];

  if (processCompanyHabilitados) {
    sidebarItemsV1.splice(2, 0, {
      icon: <Scale size={20} />,
      label: "Processos",
      items: [
        {
          label: "Cadastros",
          href: "/v1/processos/cadastros",
        },
        {
          label: "Monitoramento",
          href: "/v1/processos/monitoramento",
        },
        {
          label: "Citações",
          href: "/v1/processos/citacoes",
          amount: pendingCitationsCount // Example: count for this subitem
        },
        {
          label: "Audiências",
          href: "/v1/processos/audiencias",
          amount: pendingAudiencesCount
        },
      ]
    });
    sidebarItemsV2.splice(2, 0, {
      icon: <Scale size={20} />,
      label: "Processos",
      href: "/v2/processos",
    });
  }

  if (sentiusHabilitados) {
    sidebarItemsV1.splice(1, 0, {
      icon: <FileCheck2 size={20} />,
      label: "Sentenças",
      href: "/v1/sentencas",
    });
    sidebarItemsV2.splice(1, 0, {
      icon: <FileCheck2 size={20} />,
      label: "Sentenças",
      href: "/v2/sentencas",
    });
  }

  const sidebarItems = version === '1' ? sidebarItemsV1 : sidebarItemsV2;

  return (
    <div className="flex h-full flex-col gap-4 py-4 relative">
      <div className={cn("px-4 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && <div className="text-white text-sm font-bold">V{version}</div>}
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
        {sidebarItems.map((item, index) => (
          <SidebarItem
            key={item.href || `${item.label}-${index}`}
            icon={item.icon}
            label={item.label}
            href={item.href}
            items={item.items}
            amount={item.amount}
            isActive={pathname === item.href}
            isCollapsed={isCollapsed}
            idCompany={user?.companies?.[0]?.id}
          />
        ))}
      </div>
    </div>
  );
}
