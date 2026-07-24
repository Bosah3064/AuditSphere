"use client"

import * as React from "react"
import { Plus, ShieldAlert, Filter, Search, ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { motion } from "motion/react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRiskStore, Risk } from "@/store/risk-store"
import { RiskFormDialog } from "@/components/risks/risk-form-dialog"

export default function RisksPage() {
  const { risks, deleteRisk, fetchRisks } = useRiskStore()
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [riskToEdit, setRiskToEdit] = React.useState<Risk | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    fetchRisks()
  }, [fetchRisks])

  const getRiskScore = (impact: number, likelihood: number) => impact * likelihood

  const getRiskLevel = (score: number) => {
    if (score >= 20) return { label: "Critical", class: "bg-risk-critical/10 text-risk-critical border-risk-critical/20" }
    if (score >= 12) return { label: "High", class: "bg-risk-high/10 text-risk-high border-risk-high/20" }
    if (score >= 6) return { label: "Medium", class: "bg-risk-medium/10 text-risk-medium border-risk-medium/20" }
    return { label: "Low", class: "bg-risk-low/10 text-risk-low border-risk-low/20" }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return "bg-destructive/10 text-destructive"
      case "mitigated": return "bg-emerald-500/10 text-emerald-500"
      case "accepted": return "bg-amber-500/10 text-amber-500"
      default: return "bg-muted text-muted-foreground"
    }
  }

  // Calculate summary counts
  const summary = risks.reduce((acc, risk) => {
    const score = getRiskScore(risk.impact, risk.likelihood)
    if (score >= 20) acc.critical++
    else if (score >= 12) acc.high++
    else if (score >= 6) acc.medium++
    else acc.low++
    return acc
  }, { critical: 0, high: 0, medium: 0, low: 0 })

  const filteredRisks = risks.filter((risk) => 
    risk.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    risk.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    risk.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (risk: Risk) => {
    setRiskToEdit(risk)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setRiskToEdit(null)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this risk? This action cannot be undone.")) {
      deleteRisk(id)
    }
  }

  return (
    <div className="flex-1 space-y-6">
      <RiskFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        riskToEdit={riskToEdit} 
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Risk Register</h2>
          <p className="text-muted-foreground">
            Manage enterprise risks, assessments, and mitigation strategies.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Risk
        </Button>
      </div>

      {/* Summary Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="glass-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Critical Risks</span>
              <span className="text-2xl font-bold">{summary.critical}</span>
            </div>
            <ShieldAlert className="h-8 w-8 text-risk-critical opacity-20" />
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">High Risks</span>
              <span className="text-2xl font-bold">{summary.high}</span>
            </div>
            <ShieldAlert className="h-8 w-8 text-risk-high opacity-20" />
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Medium Risks</span>
              <span className="text-2xl font-bold">{summary.medium}</span>
            </div>
            <ShieldAlert className="h-8 w-8 text-risk-medium opacity-20" />
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Low Risks</span>
              <span className="text-2xl font-bold">{summary.low}</span>
            </div>
            <ShieldAlert className="h-8 w-8 text-risk-low opacity-20" />
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search risks..."
              className="pl-8 w-[250px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-md border glass-card overflow-hidden"
      >
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">Risk ID</TableHead>
              <TableHead>
                <Button variant="ghost" className="-ml-4 h-8 data-[state=open]:bg-accent">
                  Title
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRisks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No risks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRisks.map((risk) => {
                const score = getRiskScore(risk.impact, risk.likelihood)
                const level = getRiskLevel(score)
                
                return (
                  <TableRow key={risk.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-muted-foreground">{risk.id}</TableCell>
                    <TableCell className="font-medium hover:underline hover:text-primary cursor-pointer" onClick={() => handleEdit(risk)}>
                      {risk.title}
                    </TableCell>
                    <TableCell>{risk.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={level.class}>
                        {level.label} ({score})
                      </Badge>
                    </TableCell>
                    <TableCell>{risk.owner}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(risk.status)}>
                        {risk.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0" })}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(risk)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Risk
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(risk.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Risk
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  )
}
