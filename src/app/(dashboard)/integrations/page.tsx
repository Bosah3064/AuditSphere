"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Search, Link as LinkIcon, Unlink, RefreshCw, AlertCircle, Building2, Server, ShieldCheck, Database } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useIntegrationStore } from "@/store/integration-store"

const availableApps = [
  {
    name: "Xero",
    provider: "xero",
    category: "Financial",
    description: "Connect Xero to automate journal entry testing and anomaly detection.",
    icon: Building2,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    name: "QuickBooks Online",
    provider: "quickbooks",
    category: "Financial",
    description: "Automate AR/AP audits and financial controls testing directly from QBO.",
    icon: Database,
    color: "text-green-600",
    bg: "bg-green-600/10"
  },
  {
    name: "SAP ERP",
    provider: "sap",
    category: "Financial",
    description: "Enterprise integration for SAP. Monitors Segregation of Duties (SoD) conflicts.",
    icon: Server,
    color: "text-blue-700",
    bg: "bg-blue-700/10"
  },
  {
    name: "AWS Security Hub",
    provider: "aws",
    category: "IT Security",
    description: "Continuous control monitoring for AWS cloud infrastructure.",
    icon: ShieldCheck,
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
  {
    name: "Microsoft Azure",
    provider: "azure",
    category: "IT Security",
    description: "Monitor Azure policies and Active Directory access controls.",
    icon: ShieldCheck,
    color: "text-sky-500",
    bg: "bg-sky-500/10"
  },
  {
    name: "Workday",
    provider: "workday",
    category: "HR",
    description: "Automate payroll audits, termination access reviews, and HR compliance.",
    icon: Building2,
    color: "text-blue-600",
    bg: "bg-blue-600/10"
  },
]

export default function IntegrationsPage() {
  const { integrations, fetchIntegrations, connectIntegration, disconnectIntegration, runScan } = useIntegrationStore()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [scanningProviders, setScanningProviders] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    fetchIntegrations()
  }, [fetchIntegrations])

  const handleConnect = async (app: typeof availableApps[0]) => {
    toast.promise(
      connectIntegration({
        name: app.name,
        provider: app.provider,
        category: app.category as any,
      }),
      {
        loading: `Connecting to ${app.name}...`,
        success: `${app.name} connected successfully!`,
        error: `Failed to connect ${app.name}`,
      }
    )
  }

  const handleDisconnect = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to disconnect ${name}? Automated scans will stop.`)) {
      await disconnectIntegration(id)
      toast.success(`${name} disconnected`)
    }
  }

  const handleRunScan = async (integrationId: string, provider: string, name: string) => {
    setScanningProviders(prev => ({ ...prev, [provider]: true }))
    
    // Simulate a scan delay for realistic UX
    setTimeout(async () => {
      await runScan(integrationId)
      setScanningProviders(prev => ({ ...prev, [provider]: false }))
      toast.success(`Scan completed for ${name}. New findings have been generated!`)
    }, 2500)
  }

  const filteredApps = availableApps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 h-full">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Integrations Hub</h2>
          <p className="text-muted-foreground">
            Connect financial, IT, and HR systems for Continuous Control Monitoring (CCM).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6 pt-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredApps.map((app, i) => {
          const connectedInt = integrations.find(int => int.provider === app.provider && int.status === "Connected")
          const isScanning = scanningProviders[app.provider] || false

          return (
            <motion.div
              key={app.provider}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full flex flex-col relative overflow-hidden transition-all hover:shadow-md">
                {connectedInt && (
                  <div className="absolute top-0 right-0 p-4">
                    <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-none">
                      Connected
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${app.bg}`}>
                    <app.icon className={`h-6 w-6 ${app.color}`} />
                  </div>
                  <CardTitle>{app.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {app.category}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">{app.description}</p>
                  
                  {connectedInt && connectedInt.lastSync && (
                    <div className="mt-4 flex items-center text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                      <AlertCircle className="h-3 w-3 mr-1.5" />
                      Last scanned: {formatDistanceToNow(new Date(connectedInt.lastSync), { addSuffix: true })}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-4 border-t gap-2">
                  {connectedInt ? (
                    <>
                      <Button 
                        variant="default" 
                        className="flex-1"
                        onClick={() => handleRunScan(connectedInt.id, app.provider, app.name)}
                        disabled={isScanning}
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
                        {isScanning ? "Scanning..." : "Run Audit Scan"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        title="Disconnect"
                        onClick={() => handleDisconnect(connectedInt.id, app.name)}
                        disabled={isScanning}
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleConnect(app)}
                    >
                      <LinkIcon className="mr-2 h-4 w-4" /> Connect
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
