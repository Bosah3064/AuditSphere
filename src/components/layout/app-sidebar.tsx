"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { navigationConfig } from "@/config/navigation"
import { createClient } from "@/lib/supabase/client"
import { Icon3D } from "@/components/shared/icon-3d"
import { Logo } from "@/components/shared/logo"

// Map navigation items to vibrant 3D icon colors
const iconColorMap: Record<string, string> = {
  Dashboard: "blue",
  Clients: "emerald",
  "Trial Balance": "indigo",
  "Materiality & Sampling": "violet",
  "PBC Requests": "cyan",
  Audits: "blue",
  Findings: "rose",
  "Risk Register": "orange",
  Controls: "emerald",
  Workpapers: "indigo",
  "AI Assistant": "violet",
  Analytics: "cyan",
  Reports: "amber",
  Settings: "blue",
  RCM: "orange",
  Integrations: "emerald",
  Monitoring: "cyan",
}

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const supabase = createClient()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b h-16 flex items-center justify-center px-4 bg-sidebar text-sidebar-foreground">
        <div className="flex items-center w-full overflow-hidden">
          <Logo withText={state === "expanded"} />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {navigationConfig.mainNav.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="uppercase text-[10px] tracking-widest font-semibold text-muted-foreground/60">{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  const isDisabled = "disabled" in item && item.disabled
                  const iconColor = isActive
                    ? (iconColorMap[item.title] || "blue")
                    : "blue"
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        render={
                          <Link href={isDisabled ? "#" : item.href} className="group flex items-center gap-3">
                            <div className="shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                              <Icon3D
                                icon={item.icon}
                                size="sm"
                                color={isActive ? (iconColorMap[item.title] || "blue") : "blue"}
                                animate={isActive}
                              />
                            </div>
                            <span className={`text-sm font-medium transition-colors ${
                              isActive 
                                ? "text-foreground font-semibold" 
                                : "text-muted-foreground group-hover:text-foreground"
                            }`}>
                              {item.title}
                            </span>
                          </Link>
                        }
                        isActive={isActive}
                        tooltip={item.title}
                        className={`h-12 mb-0.5 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? "bg-primary/5 shadow-sm" 
                            : "hover:bg-muted/50"
                        } ${isDisabled ? "opacity-40 pointer-events-none" : ""}`}
                      />
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')} className="h-10 text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
