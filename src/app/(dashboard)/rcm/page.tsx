"use client"

import * as React from "react"
import { ShieldCheck, Plus, Search, HelpCircle, ArrowRight, ShieldAlert, Key, Server } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface RCMMapping {
  riskId: string
  riskTitle: string
  riskCategory: string
  controlId: string
  controlTitle: string
  controlOwner: string
  associatedSystem: string
  testingStatus: "Tested - Effective" | "Tested - Ineffective" | "Not Tested"
}

const mockRCM: RCMMapping[] = [
  {
    riskId: "RSK-001",
    riskTitle: "Unauthorized database modifications on transactional databases",
    riskCategory: "IT Security",
    controlId: "CTRL-104",
    controlTitle: "M-Pesa API endpoints require multi-factor administrative authentication",
    controlOwner: "DevOps Team",
    associatedSystem: "M-Pesa Core",
    testingStatus: "Tested - Effective"
  },
  {
    riskId: "RSK-002",
    riskTitle: "Inadequate backups of financial reporting environments",
    riskCategory: "Operational",
    controlId: "CTRL-205",
    controlTitle: "Daily automated database snapshots are stored in AWS S3 and replicated across regions",
    controlOwner: "DBA Group",
    associatedSystem: "ERP (SAP)",
    testingStatus: "Tested - Effective"
  },
  {
    riskId: "RSK-003",
    riskTitle: "Excessive user access rights granted to staff",
    riskCategory: "Compliance",
    controlId: "CTRL-310",
    controlTitle: "Bi-annual access review checks for all users with access to billing engines",
    controlOwner: "Security Admin",
    associatedSystem: "Billing Engine",
    testingStatus: "Tested - Ineffective"
  },
  {
    riskId: "RSK-004",
    riskTitle: "Data leak of customer PII via external file shares",
    riskCategory: "IT Security",
    controlId: "CTRL-112",
    controlTitle: "DLP policy blocks uploading of customer records to public drives",
    controlOwner: "Security Team",
    associatedSystem: "Active Directory / Sharepoint",
    testingStatus: "Not Tested"
  }
]

export default function RCMPage() {
  const [searchQuery, setSearchQuery] = React.useState("")

  const getStatusBadge = (status: RCMMapping["testingStatus"]) => {
    switch (status) {
      case "Tested - Effective":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Effective</Badge>
      case "Tested - Ineffective":
        return <Badge variant="destructive" className="bg-destructive/15 text-destructive border-destructive/20">Ineffective</Badge>
      case "Not Tested":
      default:
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Not Tested</Badge>
    }
  }

  const filteredRCM = mockRCM.filter(item =>
    item.riskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.controlTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.associatedSystem.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Risk-Control Matrix (RCM)</h2>
          <p className="text-muted-foreground">
            Map corporate risks to controls, systems, and design effectiveness testing statuses.
          </p>
        </div>
        <Button className="shadow-md">
          <Plus className="mr-2 h-4 w-4" />
          Create RCM Mapping
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search risks, controls, or systems..."
            className="pl-9 bg-background/50 backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 rounded-xl border glass-card overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-md z-10">
              <TableRow>
                <TableHead className="w-[280px]">Corporate Risk</TableHead>
                <TableHead className="w-[80px] text-center"></TableHead>
                <TableHead className="w-[320px]">Mitigating Control</TableHead>
                <TableHead className="w-[150px]">Target System</TableHead>
                <TableHead className="w-[120px]">Testing Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRCM.map((item, index) => (
                <TableRow key={index} className="group hover:bg-muted/20 transition-colors">
                  {/* Risk Section */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">{item.riskId}</Badge>
                        <Badge variant="outline" className="text-[10px] bg-destructive/5 text-destructive border-destructive/10">{item.riskCategory}</Badge>
                      </div>
                      <div className="text-sm font-medium leading-relaxed">{item.riskTitle}</div>
                    </div>
                  </TableCell>

                  {/* Flow Arrow */}
                  <TableCell className="text-center align-middle">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/60 mx-auto" />
                  </TableCell>

                  {/* Control Section */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">{item.controlId}</Badge>
                        <span className="text-[11px] text-muted-foreground">Owner: {item.controlOwner}</span>
                      </div>
                      <div className="text-sm text-foreground/95 leading-relaxed">{item.controlTitle}</div>
                    </div>
                  </TableCell>

                  {/* System Scope */}
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <Server className="h-3.5 w-3.5 text-primary" />
                      <span>{item.associatedSystem}</span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="align-middle">
                    {getStatusBadge(item.testingStatus)}
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
