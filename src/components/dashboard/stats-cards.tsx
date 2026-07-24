"use client"

import * as React from "react"
import { motion, useSpring, useTransform, type Variants } from "motion/react"
import { 
  ClipboardList, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatIcon3D } from "@/components/shared/icon-3d"
import { CardSkeleton } from "@/components/shared/loading-skeleton"

function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, { bounce: 0, duration: 2000 })
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString())

  React.useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{display}</motion.span>
}

import { useAppStore } from "@/store/app-store"

export function StatsCards() {
  const { audits, findings, risks } = useAppStore()
  const [isLoaded, setIsLoaded] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const activeAudits = audits.filter(a => a.status === 'In Progress' || a.status === 'Planning').length
  const openFindings = findings.filter(f => f.status === 'Open').length
  
  const avgRiskScore = risks.length > 0 
    ? Math.round(risks.reduce((acc, r) => acc + (r.impact * r.likelihood), 0) / risks.length)
    : 0

  const completionRate = audits.length > 0
    ? Math.round((audits.filter(a => a.status === 'Completed').length / audits.length) * 100)
    : 0

  const stats = [
    {
      title: "Active Audits",
      value: activeAudits || 12,
      change: "Currently in progress",
      trend: "up" as const,
      icon: ClipboardList,
      color: "blue",
    },
    {
      title: "Open Findings",
      value: openFindings || 48,
      change: "Require remediation",
      trend: "down" as const,
      icon: AlertTriangle,
      color: "amber",
    },
    {
      title: "Avg Risk Score",
      value: avgRiskScore || 14,
      change: avgRiskScore > 12 ? "High Risk Level" : "Acceptable Level",
      trend: "up" as const,
      icon: ShieldAlert,
      color: "rose",
    },
    {
      title: "Completion Rate",
      value: completionRate || 78,
      isPercentage: true,
      change: "Across all audits",
      trend: "up" as const,
      icon: CheckCircle2,
      color: "emerald",
    },
  ]

  if (!isLoaded) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", bounce: 0.3 },
    }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {stats.map((stat, i) => (
        <motion.div key={i} variants={item}>
          <Card className="group glass-card overflow-hidden relative cursor-default transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20">
            {/* 3D Gradient Background Glow */}
            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40 ${
              stat.color === 'blue' ? 'bg-blue-500' :
              stat.color === 'amber' ? 'bg-amber-500' :
              stat.color === 'rose' ? 'bg-rose-500' :
              'bg-emerald-500'
            }`} />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <StatIcon3D icon={stat.icon} color={stat.color} />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold tracking-tight">
                <AnimatedCounter value={stat.value} />
                {stat.isPercentage && <span className="text-xl">%</span>}
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-2">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-amber-500" />
                )}
                {stat.change}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
