"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-64 h-full flex-shrink-0", className)}
        {...props}
      />
    )
  }
)

Sidebar.displayName = "Sidebar"

export { Sidebar }
