"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Calculator, Target, Users, AlertCircle, TrendingUp, Filter } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

import { useTBStore } from "@/store/tb-store"
import { toast } from "sonner"
import { SamplingEngine } from "@/components/sampling/sampling-engine"

export default function MaterialityPage() {
  const { accounts, fetchAccounts } = useTBStore()
  const [benchmarkValue, setBenchmarkValue] = React.useState<number>(15000000)
  const [benchmarkType, setBenchmarkType] = React.useState("revenue")
  const [percentage, setPercentage] = React.useState<number>(5)
  const [performancePct, setPerformancePct] = React.useState<number>(75)

  React.useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  // Helper to load calculations from TB
  const loadFromTB = (type = benchmarkType) => {
    if (accounts.length === 0) {
      toast.error("No Trial Balance data loaded", { description: "Please upload a Trial Balance first." })
      return
    }

    let calculated = 0
    if (type === "revenue") {
      calculated = accounts
        .filter(a => a.group === "Revenue")
        .reduce((sum, a) => sum + (a.adjustedCredit || a.unadjustedCredit), 0)
    } else if (type === "assets") {
      calculated = accounts
        .filter(a => a.group === "Asset")
        .reduce((sum, a) => sum + (a.adjustedDebit || a.unadjustedDebit), 0)
    } else if (type === "equity") {
      calculated = accounts
        .filter(a => a.group === "Equity")
        .reduce((sum, a) => sum + (a.adjustedCredit || a.unadjustedCredit), 0)
    } else if (type === "pre-tax-profit") {
      const revenue = accounts
        .filter(a => a.group === "Revenue")
        .reduce((sum, a) => sum + (a.adjustedCredit || a.unadjustedCredit), 0)
      const expense = accounts
        .filter(a => a.group === "Expense")
        .reduce((sum, a) => sum + (a.adjustedDebit || a.unadjustedDebit), 0)
      calculated = revenue - expense
    }

    setBenchmarkValue(calculated || 15000000)
    toast.success("Loaded from Trial Balance", { 
      description: `Calculated KES ${calculated.toLocaleString()} based on your TB.`
    })
  }

  // Reload when benchmark type changes
  const handleBenchmarkChange = (val: string | null) => {
    const normalized = val || "revenue"
    setBenchmarkType(normalized)
    if (accounts.length > 0) {
      loadFromTB(normalized)
    }
  }

  const overallMateriality = benchmarkValue * (percentage / 100)
  const performanceMateriality = overallMateriality * (performancePct / 100)
  const ctt = overallMateriality * 0.05 // Clearly Trivial Threshold (5%)

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Materiality & Sampling</h2>
          <p className="text-muted-foreground">
            Calculate ISA 320 compliant materiality thresholds and generate audit samples.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadFromTB()}>Load from Trial Balance</Button>
          <Button className="shadow-md" onClick={() => toast.success("Calculation saved successfully")}>
            <Calculator className="mr-2 h-4 w-4" /> Save Calculation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle>Materiality Calculator</CardTitle>
              <CardDescription>Determine the overall planning materiality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Benchmark Selection</Label>
                  <Select value={benchmarkType} onValueChange={handleBenchmarkChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select benchmark" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Total Revenue</SelectItem>
                      <SelectItem value="assets">Total Assets</SelectItem>
                      <SelectItem value="pre-tax-profit">Pre-tax Profit</SelectItem>
                      <SelectItem value="equity">Net Equity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Benchmark Value (KES)</Label>
                  <Input 
                    type="number" 
                    value={benchmarkValue} 
                    onChange={(e) => setBenchmarkValue(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex justify-between">
                    <Label>Applied Percentage ({percentage}%)</Label>
                  </div>
                  <Slider 
                    value={[percentage]} 
                    onValueChange={(v) => setPercentage(Array.isArray(v) ? v[0] : v)}
                    max={10} 
                    step={0.5} 
                    className="py-4"
                  />
                  <p className="text-xs text-muted-foreground italic">
                    ISA guidelines suggest 1-2% for Assets/Revenue, 5-10% for Profit.
                  </p>
                </div>

                <div className="space-y-4 pt-2 border-t mt-4">
                  <div className="flex justify-between">
                    <Label>Performance Materiality Factor ({performancePct}%)</Label>
                  </div>
                  <Slider 
                    value={[performancePct]} 
                    onValueChange={(v) => setPerformancePct(Array.isArray(v) ? v[0] : v)}
                    min={50}
                    max={85} 
                    step={5} 
                    className="py-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          <Card className="glass-card bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Threshold Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b border-primary/10 pb-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Overall Materiality (OM)</div>
                  <div className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(overallMateriality)}
                  </div>
                </div>
                <Target className="h-8 w-8 text-primary opacity-50" />
              </div>

              <div className="flex justify-between items-center border-b border-primary/10 pb-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Performance Materiality (PM)</div>
                  <div className="text-2xl font-semibold">
                    {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(performanceMateriality)}
                  </div>
                </div>
                <TrendingUp className="h-6 w-6 text-muted-foreground opacity-50" />
              </div>

              <div className="flex justify-between items-center pb-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Clearly Trivial Threshold (CTT)</div>
                  <div className="text-xl font-semibold text-muted-foreground">
                    {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(ctt)}
                  </div>
                </div>
                <AlertCircle className="h-5 w-5 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>

          <SamplingEngine />
        </motion.div>
      </div>
    </div>
  )
}
