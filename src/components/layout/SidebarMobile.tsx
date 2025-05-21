"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "./SidebarContent";
import { cn } from "@/utils/cn";
import { GetBgColor } from "./GetBgColor";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";

interface SidebarMobileProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function SidebarMobile({ toggleSidebar }: SidebarMobileProps) {
  const [open, setOpen] = useState(false);
  const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-blue-700 p-0">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className={cn(
        "p-0 text-white w-64 border-none",
        GetBgColor(user?.companies?.[0]?.id)
      )}>
        <SidebarContent
          isCollapsed={false}
          toggleSidebar={toggleSidebar}
          showToggleButton={false}
        />
      </SheetContent>
    </Sheet>
  );
}
