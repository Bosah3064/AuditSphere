import { Metadata } from "next"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RiskHeatmap } from "@/components/dashboard/risk-heatmap"
import { AuditProgress } from "@/components/dashboard/audit-progress"
import { FindingsChart } from "@/components/dashboard/findings-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { AIInsights } from "@/components/dashboard/ai-insights"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Executive overview of your audit universe",
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-8">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Executive overview of your organization&apos;s audit universe and risk profile.
        </p>
      </div>
      
      <StatsCards />
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
        <RiskHeatmap />
        <AuditProgress />
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
        <FindingsChart />
        <AIInsights />
      </div>

      <div className="grid gap-8 grid-cols-1">
        <RecentActivity />
      </div>
    </div>
  )
}
