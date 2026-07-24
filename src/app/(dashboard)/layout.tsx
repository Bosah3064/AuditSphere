import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { RealtimeProvider } from "@/components/providers/realtime-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RealtimeProvider>
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-h-screen max-w-full overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
    </RealtimeProvider>
  )
}
