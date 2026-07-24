"use client"

import * as React from "react"
import { AlertOctagon, ShieldAlert, CheckCircle, RefreshCw, Filter, Server, Play, CircleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

interface MonitorRule {
  id: string
  name: string
  frequency: string
  lastRun: string
  targetSystem: string
  status: "Passing" | "Failing"
  alertCount: number
  description: string
}

const mockRules: MonitorRule[] = [
  {
    id: "CCM-001",
    name: "Duplicate Invoice Payments Check",
    frequency: "Hourly",
    lastRun: "10 minutes ago",
    targetSystem: "ERP (SAP)",
    status: "Failing",
    alertCount: 3,
    description: "Queries active accounts payable records for invoices with identical values, vendor codes, and date ranges."
  },
  {
    id: "CCM-002",
    name: "Segregation of Duties (SoD) Violations",
    frequency: "Daily",
    lastRun: "Today, 04:00 AM",
    targetSystem: "Active Directory",
    status: "Passing",
    alertCount: 0,
    description: "Verifies if any single user account holds both 'Developer' and 'Production Approver' access groups."
  },
  {
    id: "CCM-003",
    name: "Unauthorized Database Schema Modifications",
    frequency: "Real-time",
    lastRun: "Just now",
    targetSystem: "M-Pesa Core Database",
    status: "Failing",
    alertCount: 1,
    description: "Triggered whenever DDL statements (ALTER, DROP) are executed outside of approved maintenance windows."
  },
  {
    id: "CCM-004",
    name: "Privileged Access Group Logins",
    frequency: "Real-time",
    lastRun: "2 minutes ago",
    targetSystem: "AWS Production Cloud",
    status: "Passing",
    alertCount: 0,
    description: "Detects active console login sessions to root account admin panels without active MFA sessions."
  }
]

export default function MonitoringPage() {
  const [rules, setRules] = React.useState<MonitorRule[]>(mockRules)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRunCheck = (id: string) => {
    toast.success("Triggered automated check run", {
      description: `Rule ${id} is executing. Check console for details.`
    })
  }

  const handleRefreshAll = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success("Continuous monitoring rules refreshed", {
        description: "All automated control test scenarios are up to date."
      })
    }, 1000)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Continuous Control Monitoring (CCM)</h2>
          <p className="text-muted-foreground">
            Automated robotic control testing scripts mapping real-time application database events.
          </p>
        </div>
        <Button variant="outline" onClick={handleRefreshAll} disabled={isRefreshing} className="shadow-sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Checks
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertOctagon className="h-4 w-4" /> Active Exceptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {rules.reduce((sum, r) => sum + r.alertCount, 0)} Alerts
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across {rules.filter(r => r.status === "Failing").length} failing automated controls.</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-500 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Healthy Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">
              {rules.filter(r => r.status === "Passing").length} / {rules.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Passing all transaction verification criteria.</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Automation Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">84%</div>
            <p className="text-xs text-muted-foreground mt-1">Of defined corporate control framework is automated.</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid */}
      <div className="flex-1 rounded-xl border glass-card overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-md z-10">
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[280px]">Automated Script</TableHead>
                <TableHead className="w-[120px]">Target System</TableHead>
                <TableHead className="w-[100px]">Frequency</TableHead>
                <TableHead className="w-[120px]">Last Run</TableHead>
                <TableHead className="w-[120px]">Control Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id} className="group hover:bg-muted/20 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">{rule.id}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-medium text-sm">{rule.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{rule.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Server className="h-3 w-3" />
                      <span>{rule.targetSystem}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-background">{rule.frequency}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-medium">{rule.lastRun}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {rule.status === "Passing" ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs font-semibold text-emerald-500">Passing</span>
                        </>
                      ) : (
                        <>
                          <CircleAlert className="h-4 w-4 text-destructive" />
                          <span className="text-xs font-semibold text-destructive">{rule.alertCount} Exceptions</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRunCheck(rule.id)}
                    >
                      <Play className="h-3 w-3 mr-1" /> Run Now
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
