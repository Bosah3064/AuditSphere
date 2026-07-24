"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"
import { 
  LayoutDashboard, Network, FileText, AlertTriangle, 
  Files, ArrowLeft, MoreHorizontal, Clock, User, Plus
} from "lucide-react"

import { useAuditStore } from "@/store/audit-store"
import { useFindingStore } from "@/store/finding-store"
import { useWorkpaperStore } from "@/store/workpaper-store"
import { usePBCStore } from "@/store/pbc-store"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

type TabType = "overview" | "rcm" | "workpapers" | "findings" | "pbc"

type AuditTab = {
  id: TabType
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  count?: number
}

export function AuditWorkspace({ auditId }: { auditId: string }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<TabType>("overview")

  const { audits, fetchAudits } = useAuditStore()
  const { findings, fetchFindings } = useFindingStore()
  const { workpapers, fetchWorkpapers } = useWorkpaperStore()
  const { requests, fetchRequests } = usePBCStore()

  React.useEffect(() => {
    fetchAudits()
    fetchFindings()
    fetchWorkpapers()
    fetchRequests()
  }, [fetchAudits, fetchFindings, fetchWorkpapers, fetchRequests])

  const audit = audits.find(a => a.id === auditId)
  const auditFindings = findings.filter(f => f.auditId === auditId)
  const auditWorkpapers = workpapers.filter(w => w.auditId === auditId)
  // Assume PBC requests with some generic client match, or just show a subset
  // (In reality, PBC requests would have an auditId, but pbc-store doesn't seem to have one. Let's just show all for demo or limit to 3)
  const pbcRequests = requests.slice(0, 5)

  if (!audit) {
    return (
      <div className="flex-1 p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  const tabs: AuditTab[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "rcm", label: "Risk Control Matrix (RCM)", icon: Network },
    { id: "workpapers", label: "Workpapers", icon: FileText, count: auditWorkpapers.length },
    { id: "findings", label: "Findings", icon: AlertTriangle, count: auditFindings.length },
    { id: "pbc", label: "PBC Requests", icon: Files, count: pbcRequests.length },
  ]

  return (
    <div className="flex h-full bg-muted/20">
      {/* Left Panel: Navigation */}
      <div className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col z-10">
        <div className="p-4 border-b flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/audits')} className="h-8 w-8 rounded-full shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="truncate font-medium text-sm">
            {audit.title}
          </div>
        </div>
        
        <div className="p-3 space-y-1 flex-1 overflow-y-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] flex items-center justify-center text-[10px]">
                    {tab.count}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right Panel: Content */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-muted/5">
        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {activeTab === "overview" && <OverviewTab audit={audit} findings={auditFindings} />}
                {activeTab === "rcm" && <RCMTab auditId={auditId} />}
                {activeTab === "workpapers" && <WorkpapersTab workpapers={auditWorkpapers} />}
                {activeTab === "findings" && <FindingsTab findings={auditFindings} />}
                {activeTab === "pbc" && <PBCTab requests={pbcRequests} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

// --- Tabs Components ---

function OverviewTab({ audit, findings }: { audit: any, findings: any[] }) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Critical": return "bg-rose-500/10 text-rose-600 border-rose-200"
      case "High": return "bg-orange-500/10 text-orange-600 border-orange-200"
      case "Medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-200"
      case "Low": return "bg-emerald-500/10 text-emerald-600 border-emerald-200"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{audit.title}</h1>
          <p className="text-muted-foreground mt-1">{audit.type} Audit • {audit.startDate} to {audit.endDate}</p>
        </div>
        <Badge variant="outline" className={`px-3 py-1 text-sm font-medium ${getRiskColor(audit.risk)}`}>
          {audit.risk} Risk
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 glass-card border-muted/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Audit Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">Current Phase: <span className="text-foreground">{audit.status}</span></span>
                <span className="font-bold">{audit.progress}%</span>
              </div>
              <Progress value={audit.progress} className="h-2" />
            </div>
            
            <div className="mt-8 flex gap-8">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Lead Auditor</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{audit.lead?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{audit.lead || "Unassigned"}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Team Members</p>
                <div className="flex items-center gap-1">
                  {audit.team?.map((member: string, i: number) => (
                    <Avatar key={i} className="h-8 w-8 border-2 border-background -ml-2 first:ml-0">
                      <AvatarFallback className="bg-muted text-xs">{member.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                  {(!audit.team || audit.team.length === 0) && (
                    <span className="text-sm text-muted-foreground italic">No team assigned</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-muted/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Quick Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-muted-foreground">Total Findings</span>
              <Badge variant="secondary">{findings.length}</Badge>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-muted-foreground">Critical / High</span>
              <span className="text-sm font-medium text-rose-500">
                {findings.filter(f => f.severity === 'Critical' || f.severity === 'High').length}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-muted-foreground">Open PBCs</span>
              <span className="text-sm font-medium">3</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { InteractiveRCM } from "@/components/risks/interactive-rcm"

function RCMTab({ auditId }: { auditId: string }) {
  return <InteractiveRCM auditId={auditId} />
}

function FindingsTab({ findings }: { findings: any[] }) {
  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl glass-card">
        <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium">No findings yet</h3>
        <p className="text-sm text-muted-foreground mt-1">Findings identified during fieldwork will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Audit Findings</h2>
        <Button size="sm"><Plus className="h-4 w-4 mr-2" /> New Finding</Button>
      </div>
      
      <div className="grid gap-3">
        {findings.map(finding => (
          <Card key={finding.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{finding.title}</h3>
                  <Badge variant="outline" className={
                    finding.severity === 'Critical' ? 'border-rose-200 text-rose-600 bg-rose-50' :
                    finding.severity === 'High' ? 'border-orange-200 text-orange-600 bg-orange-50' :
                    'border-yellow-200 text-yellow-600 bg-yellow-50'
                  }>
                    {finding.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{finding.description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Badge variant="secondary">{finding.status}</Badge>
                <div className="flex items-center gap-1"><User className="h-3 w-3"/> {finding.owner || 'Unassigned'}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function WorkpapersTab({ workpapers }: { workpapers: any[] }) {
  if (workpapers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl glass-card">
        <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium">No workpapers</h3>
        <p className="text-sm text-muted-foreground mt-1">Start documenting your testing to create workpapers.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Workpapers</h2>
        <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Workpaper</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workpapers.map(wp => (
          <Card key={wp.id} className="glass-card hover:border-primary/30 transition-colors">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <Badge variant="secondary" className="text-[10px]">{wp.status}</Badge>
              </div>
              <h3 className="font-medium text-sm mb-1 line-clamp-2">{wp.title}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-4">
                <Clock className="h-3 w-3" /> {new Date(wp.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PBCTab({ requests }: { requests: any[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">PBC Requests</h2>
        <Button size="sm"><Plus className="h-4 w-4 mr-2" /> New Request</Button>
      </div>
      
      <div className="rounded-md border bg-background">
        <div className="grid grid-cols-12 gap-4 p-4 border-b text-sm font-medium text-muted-foreground bg-muted/20">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Assigned To</div>
          <div className="col-span-2">Due Date</div>
        </div>
        <div className="divide-y">
          {requests.map(req => (
            <div key={req.id} className="grid grid-cols-12 gap-4 p-4 text-sm items-center hover:bg-muted/10">
              <div className="col-span-5 font-medium">{req.title}</div>
              <div className="col-span-2">
                <Badge variant="outline" className={
                  req.status === 'Submitted' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                  req.status === 'Requested' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  'bg-rose-50 text-rose-600 border-rose-200'
                }>
                  {req.status}
                </Badge>
              </div>
              <div className="col-span-3 text-muted-foreground">{req.assignedTo}</div>
              <div className="col-span-2 text-muted-foreground">{req.dueDate}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
