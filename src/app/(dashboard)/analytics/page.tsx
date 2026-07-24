"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Area, AreaChart, Cell } from "recharts"
import { Target, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const completionData = [
  { month: "Jan", planned: 12, completed: 10 },
  { month: "Feb", planned: 15, completed: 14 },
  { month: "Mar", planned: 10, completed: 10 },
  { month: "Apr", planned: 14, completed: 12 },
  { month: "May", planned: 16, completed: 18 },
  { month: "Jun", planned: 12, completed: 13 },
  { month: "Jul", planned: 10, completed: 5 },
]

const findingsDeptData = [
  { department: "IT", count: 45 },
  { department: "Finance", count: 32 },
  { department: "Operations", count: 28 },
  { department: "HR", count: 12 },
  { department: "Legal", count: 8 },
]

const riskTrendData = [
  { month: "Jan", score: 450 },
  { month: "Feb", score: 420 },
  { month: "Mar", score: 380 },
  { month: "Apr", score: 410 },
  { month: "May", score: 360 },
  { month: "Jun", score: 310 },
  { month: "Jul", score: 290 },
]

const chartConfigCompletion = {
  planned: { label: "Planned", color: "#3AA335" }, /* Safaricom Green */
  completed: { label: "Completed", color: "#DE1E23" }, /* Safaricom Red */
} satisfies ChartConfig

const chartConfigDept = {
  count: { label: "Findings", color: "#3AA335" },
} satisfies ChartConfig

const chartConfigRisk = {
  score: { label: "Risk Score", color: "#DE1E23" },
} satisfies ChartConfig

const findingsSeverityData = [
  { month: "Jan", critical: 2, high: 5, medium: 12, low: 18 },
  { month: "Feb", critical: 1, high: 6, medium: 15, low: 20 },
  { month: "Mar", critical: 3, high: 4, medium: 10, low: 15 },
  { month: "Apr", critical: 0, high: 3, medium: 8, low: 22 },
  { month: "May", critical: 1, high: 2, medium: 14, low: 25 },
  { month: "Jun", critical: 0, high: 1, medium: 9, low: 19 },
]

const auditLifecycleData = [
  { phase: "Planning", count: 4, fill: "var(--color-Planning)" },
  { phase: "Fieldwork", count: 6, fill: "var(--color-Fieldwork)" },
  { phase: "Reporting", count: 3, fill: "var(--color-Reporting)" },
  { phase: "Review", count: 2, fill: "var(--color-Review)" },
]

const chartConfigSeverity = {
  critical: { label: "Critical", color: "#DE1E23" }, /* Safaricom Red */
  high: { label: "High", color: "#FF8C00" }, /* Orange */
  medium: { label: "Medium", color: "#FFD700" }, /* Yellow */
  low: { label: "Low", color: "#3AA335" }, /* Safaricom Green */
} satisfies ChartConfig

const chartConfigLifecycle = {
  count: { label: "Audits" },
  Planning: { label: "Planning", color: "#3AA335" }, /* Green */
  Fieldwork: { label: "Fieldwork", color: "#DE1E23" }, /* Red */
  Reporting: { label: "Reporting", color: "#0096D6" }, /* Blue */
  Review: { label: "Review", color: "#FFD700" }, /* Yellow */
} satisfies ChartConfig

export default function AnalyticsPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Deep dive into audit performance and risk metrics.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-sm text-muted-foreground">+12% from last year</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18 days</div>
              <p className="text-sm text-muted-foreground">-2 days from last quarter</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Finding Resolution</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">82%</div>
              <p className="text-sm text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Risks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">34</div>
              <p className="text-sm text-muted-foreground">-8 from last month</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Controls Tested</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-sm text-muted-foreground">+245 this quarter</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Adoptions</CardTitle>
              <Zap className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">73%</div>
              <p className="text-sm text-muted-foreground">Recommendations accepted</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-6 md:grid-cols-2"
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Audit Completion Trend</CardTitle>
            <CardDescription>Planned vs Completed Audits</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigCompletion} className="min-h-[250px] w-full">
              <LineChart data={completionData}>
                <CartesianGrid vertical={false} opacity={0.3} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="planned" stroke="#3AA335" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="completed" stroke="#DE1E23" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Risk Score Trend</CardTitle>
            <CardDescription>Enterprise risk aggregation over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigRisk} className="min-h-[250px] w-full">
              <AreaChart data={riskTrendData}>
                <defs>
                  <linearGradient id="fillRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DE1E23" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#DE1E23" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} opacity={0.3} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="score" stroke="#DE1E23" fill="url(#fillRisk)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* NEW: Findings by Severity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Findings by Severity</CardTitle>
            <CardDescription>Historical trend over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigSeverity} className="min-h-[250px] w-full">
              <BarChart data={findingsSeverityData}>
                <CartesianGrid vertical={false} opacity={0.3} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="critical" stackId="a" fill="#DE1E23" radius={[0, 0, 0, 0]} />
                <Bar dataKey="high" stackId="a" fill="#FF8C00" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" stackId="a" fill="#FFD700" radius={[0, 0, 0, 0]} />
                <Bar dataKey="low" stackId="a" fill="#3AA335" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* NEW: Audit Lifecycle */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Audit Lifecycle</CardTitle>
            <CardDescription>Current active audits by phase</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigLifecycle} className="min-h-[250px] w-full">
              <BarChart data={auditLifecycleData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} opacity={0.3} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="phase" type="category" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {auditLifecycleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-card md:col-span-2">
          <CardHeader>
            <CardTitle>Findings by Department</CardTitle>
            <CardDescription>Total findings distributed across business units</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigDept} className="min-h-[300px] w-full">
              <BarChart data={findingsDeptData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} opacity={0.3} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="department" type="category" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#3AA335" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
