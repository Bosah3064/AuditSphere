"use client"

import * as React from "react"
import { motion } from "motion/react"
import { 
  FileText, Download, Calendar, Filter,
  ClipboardList, AlertTriangle, ShieldAlert, 
  BarChart3, FileSpreadsheet, FileDown
} from "lucide-react"
import { toast } from "sonner"
import { generateDynamicPDFReport, generateDynamicExcelReport, generateDynamicWordReport } from "@/lib/report-generator"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icon3D } from "@/components/shared/icon-3d"
import { useAuditStore } from "@/store/audit-store"
import { useFindingStore } from "@/store/finding-store"
import { useRiskStore } from "@/store/risk-store"
import { useControlStore } from "@/store/control-store"

const reportTemplates = [
  {
    id: "audit-report",
    title: "Audit Report",
    description: "Comprehensive audit engagement report with findings, recommendations, and management responses.",
    icon: ClipboardList,
    color: "blue",
    formats: ["PDF", "Word"],
    category: "Engagement",
  },
  {
    id: "management-letter",
    title: "Management Letter",
    description: "Formal communication to management highlighting significant audit findings and recommendations.",
    icon: FileText,
    color: "violet",
    formats: ["PDF", "Word"],
    category: "Engagement",
  },
  {
    id: "executive-summary",
    title: "Executive Summary",
    description: "High-level summary of the audit universe, key risks, and overall compliance posture.",
    icon: BarChart3,
    color: "emerald",
    formats: ["PDF"],
    category: "Management",
  },
  {
    id: "risk-report",
    title: "Risk Report",
    description: "Detailed risk register with heat maps, control mapping, and residual risk analysis.",
    icon: ShieldAlert,
    color: "rose",
    formats: ["PDF", "Excel"],
    category: "Risk",
  },
  {
    id: "compliance-report",
    title: "Compliance Report",
    description: "Compliance status against ISA, IFRS, COSO frameworks with gap analysis and action items.",
    icon: FileSpreadsheet,
    color: "cyan",
    formats: ["PDF", "Excel"],
    category: "Compliance",
  },
  {
    id: "findings-tracker",
    title: "Findings Tracker",
    description: "All audit findings with status tracking, owner assignments, due dates, and aging analysis.",
    icon: AlertTriangle,
    color: "amber",
    formats: ["Excel"],
    category: "Management",
  },
]

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const { audits, fetchAudits } = useAuditStore()
  const { findings, fetchFindings } = useFindingStore()
  const { risks, fetchRisks } = useRiskStore()
  const { controls, fetchControls } = useControlStore()

  React.useEffect(() => {
    fetchAudits()
    fetchFindings()
    fetchRisks()
    fetchControls()
  }, [fetchAudits, fetchFindings, fetchRisks, fetchControls])

  const handleGenerate = (reportId: string, format: string) => {
    const report = reportTemplates.find(r => r.id === reportId)
    const reportTitle = report?.title || "AuditSphere Report"

    toast.success(`Generating ${reportTitle} (${format})...`, {
      description: "Your report will be ready for download shortly.",
    })
    
    const data = { audits, findings, risks, controls }

    setTimeout(() => {
      if (format === "PDF") {
        generateDynamicPDFReport(reportId, reportTitle, data)
      } else if (format === "Excel") {
        generateDynamicExcelReport(reportId, reportTitle, data)
      } else if (format === "Word") {
        generateDynamicWordReport(reportId, reportTitle, data)
      } else {
        toast.info(`${format} format coming soon!`)
      }
    }, 600)
  }

  const filteredTemplates = selectedCategory === "all"
    ? reportTemplates
    : reportTemplates.filter(r => r.category === selectedCategory)

  const handleCategoryChange = (value: string | null) => {
    setSelectedCategory(value || "all")
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Generate professional audit reports, management letters, and compliance summaries.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Engagement">Engagement</SelectItem>
              <SelectItem value="Management">Management</SelectItem>
              <SelectItem value="Risk">Risk</SelectItem>
              <SelectItem value="Compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Card className="group h-full flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20">
              {/* Glow */}
              <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
                report.color === 'blue' ? 'bg-blue-500' :
                report.color === 'violet' ? 'bg-violet-500' :
                report.color === 'emerald' ? 'bg-emerald-500' :
                report.color === 'rose' ? 'bg-rose-500' :
                report.color === 'cyan' ? 'bg-cyan-500' :
                'bg-amber-500'
              }`} />

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Icon3D icon={report.icon} color={report.color} size="md" animate />
                  <Badge variant="secondary" className="text-xs font-normal">
                    {report.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {report.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-end pt-0">
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  {report.formats.map((format) => (
                    <Button
                      key={format}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => handleGenerate(report.id, format)}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      {format}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ISA Compliance Notice */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">ISA & IFRS Compliance</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                All reports generated by AuditSphere are designed to align with International Standards on Auditing (ISA), 
                International Financial Reporting Standards (IFRS), and the COSO Internal Control Framework. 
                Organizations may configure additional local regulatory requirements through the Settings panel.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
