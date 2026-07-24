"use client"

import React, { useEffect, useState } from "react"
import { motion } from "motion/react"
import { useRiskStore, Risk } from "@/store/risk-store"
import { useControlStore } from "@/store/control-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Plus, ShieldCheck, Activity } from "lucide-react"

interface InteractiveRCMProps {
  auditId?: string
}

export function InteractiveRCM({ auditId }: InteractiveRCMProps) {
  const { risks, fetchRisks, isLoading: loadingRisks } = useRiskStore()
  const { controls, fetchControls, addControl } = useControlStore()
  
  useEffect(() => {
    fetchRisks()
    fetchControls()
  }, [fetchRisks, fetchControls])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-3xl font-semibold tracking-tight">Risk Control Matrix</h2>
        <p className="text-muted-foreground">
          Map controls to identified risks. Unmitigated risks are highlighted.
        </p>
      </div>

      <div className="space-y-6">
        {risks.map((risk, idx) => (
          <RiskMatrixRow 
            key={risk.id} 
            risk={risk} 
            allControls={controls} 
            onAddControl={addControl} 
            index={idx}
          />
        ))}
        {risks.length === 0 && !loadingRisks && (
          <div className="p-12 text-center text-muted-foreground glass-card rounded-xl border border-dashed">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 opacity-20" />
              <p>No risks found. Add risks to build your matrix.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RiskMatrixRow({ risk, allControls, onAddControl, index }: { risk: Risk; allControls: any[], onAddControl: (c: any) => void, index: number }) {
  const mappedControls = allControls.filter(c => c.riskId === risk.id)
  const hasControls = mappedControls.length > 0
  const isUnmitigated = !hasControls || risk.status === "Open"

  const severityScore = risk.impact * risk.likelihood
  let severityLabel = "Low"
  let severityClasses = "bg-risk-low text-risk-low"
  if (severityScore >= 15) { severityLabel = "Critical"; severityClasses = "bg-risk-critical text-risk-critical" }
  else if (severityScore >= 10) { severityLabel = "High"; severityClasses = "bg-risk-high text-risk-high" }
  else if (severityScore >= 5) { severityLabel = "Medium"; severityClasses = "bg-risk-medium text-risk-medium" }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative glass-card rounded-xl border transition-all hover:shadow-md ${
        isUnmitigated && !hasControls ? "border-destructive/30 bg-destructive/5" : "border-border/50 bg-background/50"
      }`}
    >
      <div className="flex flex-col xl:flex-row min-h-[160px]">
        
        {/* Left Area: Risk Info */}
        <div className="w-full xl:w-1/3 p-6 flex flex-col justify-center border-b xl:border-b-0 xl:border-r border-border/50 bg-muted/10 relative overflow-hidden rounded-t-xl xl:rounded-tr-none xl:rounded-l-xl">
          {isUnmitigated && !hasControls && (
             <div className="absolute top-0 right-0 p-4" title="Unmitigated Risk">
                <AlertCircle className="w-5 h-5 text-destructive opacity-80" />
             </div>
          )}
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`font-semibold border-transparent ${severityClasses}`}>
                 {severityLabel}
              </Badge>
              {hasControls && (
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Mitigated
                </Badge>
              )}
            </div>
            
            <h3 className="font-semibold text-lg tracking-tight leading-tight">{risk.title}</h3>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {risk.category}</span>
              <span className="flex items-center gap-1">Owner: {risk.owner}</span>
            </div>
          </div>
        </div>

        {/* Right Area: Controls Horizontal List */}
        <div className="w-full xl:w-2/3 p-6 flex items-center overflow-hidden relative">
          <div className="flex items-stretch gap-4 overflow-x-auto pb-2 pt-2 px-2 -mx-2 snap-x w-full" style={{ scrollbarWidth: 'thin' }}>
            {mappedControls.map((control, cIdx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 + cIdx * 0.05 }}
                key={control.id} 
                className="snap-start shrink-0 w-[280px] bg-background rounded-lg border border-border/50 shadow-sm p-4 flex flex-col gap-3 relative group hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-sm leading-tight">{control.title}</span>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{control.type}</Badge>
                </div>
                {control.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-auto">{control.description}</p>
                )}
                <div className="flex items-center justify-between text-xs mt-2 pt-3 border-t border-border/50">
                  <span className="text-muted-foreground font-medium">
                     {control.frequency}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    control.status === 'Effective' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                    control.status === 'Ineffective' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                    'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {control.status}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Add Control Card */}
            <div className="snap-start shrink-0 flex items-center justify-center min-w-[200px]">
               <AddControlDialog riskId={risk.id} onAddControl={onAddControl} />
            </div>
          </div>
          
          {/* Subtle fade on right edge if scrollable */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none xl:block hidden" />
        </div>
        
      </div>
    </motion.div>
  )
}

function AddControlDialog({ riskId, onAddControl }: { riskId: string, onAddControl: (c: any) => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"Preventive" | "Detective" | "Corrective">("Preventive")
  const [frequency, setFrequency] = useState<"Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annual" | "As Needed">("Monthly")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    onAddControl({
      title,
      type,
      frequency,
      status: "Not Tested",
      owner: "Unassigned",
      riskId
    })
    setTitle("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="h-full min-h-[140px] w-full rounded-lg border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary group">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
           <Plus className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-medium">Add Control</span>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Add Control to Risk</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Control Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Monthly Reconciliation" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Preventive">Preventive</SelectItem>
                  <SelectItem value="Detective">Detective</SelectItem>
                  <SelectItem value="Corrective">Corrective</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Annual">Annual</SelectItem>
                  <SelectItem value="As Needed">As Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Create Control</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
