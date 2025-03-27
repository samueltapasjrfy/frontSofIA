"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "./SidebarContent";

interface SidebarMobileProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function SidebarMobile({ toggleSidebar }: SidebarMobileProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-blue-700 p-0">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-primary-blue text-white w-64 border-none">
        <SidebarContent 
          isCollapsed={false} 
          toggleSidebar={toggleSidebar}
          showToggleButton={false}
        />
      </SheetContent>
    </Sheet>
  );
}
