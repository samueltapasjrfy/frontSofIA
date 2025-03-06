"use client";

import { ReactNode } from "react";
import { SidebarProvider } from "./SidebarProvider";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { PublicationsProvider } from "@/contexts/PublicationsContext";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SidebarProvider>
      <DashboardProvider>
        <PublicationsProvider>
          {children}
        </PublicationsProvider>
      </DashboardProvider>
    </SidebarProvider>
  );
} 