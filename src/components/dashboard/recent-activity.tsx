"use client"

import * as React from "react"
import { motion } from "motion/react"
import { formatDistanceToNow } from "date-fns"
import { ClipboardList, AlertTriangle, MessageSquare, FileCheck } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useAppStore } from "@/store/app-store"

const mockActivities = [
  {
    id: 1,
    user: { name: "Sarah Jenkins", avatar: "", initials: "SJ" },
    action: "approved",
    entity: "Q3 Financial Audit Plan",
    type: "audit",
    time: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    id: 2,
    user: { name: "AI Assistant", avatar: "", initials: "AI", isAi: true },
    action: "suggested risk",
    entity: "Vendor Dependency Concentration",
    type: "risk",
    time: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  }
]

const getIcon = (type: string) => {
  switch (type) {
    case "audit": return <ClipboardList className="h-4 w-4 text-primary" />
    case "finding": return <AlertTriangle className="h-4 w-4 text-accent" />
    case "risk": return <AlertTriangle className="h-4 w-4 text-destructive" />
    case "workpaper": return <FileCheck className="h-4 w-4 text-emerald-500" />
    default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />
  }
}

export function RecentActivity() {
  const { audits, findings, risks } = useAppStore()
  
  // Create a synthetic activity feed from our actual data
  const dynamicActivities = React.useMemo(() => {
    const feed: Array<{
      id: string
      user: { name: string; avatar: string; initials: string; isAi?: boolean }
      action: string
      entity: string
      type: string
      time: Date
    }> = []
    
    // Add latest audits
    audits.slice(0, 2).forEach((a, i) => {
      feed.push({
        id: `audit-${a.id}`,
        user: { name: "System User", avatar: "", initials: "SU" },
        action: a.status === 'Completed' ? "completed audit" : "updated audit",
        entity: a.title,
        type: "audit",
        time: new Date(Date.now() - 1000 * 60 * 60 * (i + 1))
      })
    })
    
    // Add latest findings
    findings.slice(0, 2).forEach((f, i) => {
      feed.push({
        id: `finding-${f.id}`,
        user: { name: "Auditor", avatar: "", initials: "AU" },
        action: "flagged finding",
        entity: f.title,
        type: "finding",
        time: new Date(Date.now() - 1000 * 60 * 60 * (i + 2))
      })
    })

    // Add latest risks
    risks.slice(0, 1).forEach((r, i) => {
      feed.push({
        id: `risk-${r.id}`,
        user: { name: "Risk Manager", avatar: "", initials: "RM" },
        action: "identified risk",
        entity: r.title,
        type: "risk",
        time: new Date(Date.now() - 1000 * 60 * 60 * (i + 3))
      })
    })

    return feed.sort((a, b) => b.time.getTime() - a.time.getTime())
  }, [audits, findings, risks])
  
  const activities = dynamicActivities.length > 0 ? dynamicActivities : mockActivities

  return (
    <Card className="glass-card col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across your team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                  <AvatarFallback className={activity.user.isAi ? "bg-accent text-accent-foreground" : ""}>
                    {activity.user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-background border border-border">
                  {getIcon(activity.type)}
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none">
                  <span className="font-medium text-foreground">{activity.user.name}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-medium text-foreground">{activity.entity}</span>
                </p>
                <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                  {formatDistanceToNow(activity.time, { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
