"use client"

import * as React from "react"
import { Upload, Download, Calculator, CheckCircle2, TrendingUp, TrendingDown, Activity, Settings } from "lucide-react"

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
import { useTBStore } from "@/store/tb-store"
import { TBUploadDialog } from "@/components/trial-balance/tb-upload-dialog"
import { AdjustmentDialog } from "@/components/trial-balance/adjustment-dialog"

export default function TrialBalancePage() {
  const { accounts, fetchAccounts, isLoading } = useTBStore()
  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [adjOpen, setAdjOpen] = React.useState(false)

  React.useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "-"
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Calculate totals
  const totals = accounts.reduce((acc, curr) => {
    acc.unadjDr += curr.unadjustedDebit
    acc.unadjCr += curr.unadjustedCredit
    acc.adjDr += curr.adjustmentDebit
    acc.adjCr += curr.adjustmentCredit
    acc.finalDr += curr.adjustedDebit
    acc.finalCr += curr.adjustedCredit
    return acc
  }, { unadjDr: 0, unadjCr: 0, adjDr: 0, adjCr: 0, finalDr: 0, finalCr: 0 })

  const isBalanced = totals.finalDr === totals.finalCr

  const handleUpload = () => {
    setUploadOpen(true)
  }

  return (
    <div className="flex flex-col space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Working Trial Balance</h2>
            <Badge variant="outline" className="text-xs ml-2 border-primary/30 text-primary">ICPAK COMPLIANT</Badge>
          </div>
          <p className="text-muted-foreground">
            Map accounts, pass adjusting journal entries, and generate lead schedules.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload TB
          </Button>
          <Button className="shadow-md" onClick={() => setAdjOpen(true)}>
            <Calculator className="mr-2 h-4 w-4" />
            New Adjustment
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <div className="text-2xl font-bold text-emerald-500">Balanced</div>
                </>
              ) : (
                <>
                  <Activity className="h-5 w-5 text-destructive" />
                  <div className="text-2xl font-bold text-destructive">Unbalanced</div>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Final Difference: {formatCurrency(Math.abs(totals.finalDr - totals.finalCr))}
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Adjustments</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.filter(a => a.adjustmentDebit > 0 || a.adjustmentCredit > 0).length} Entries</div>
            <p className="text-sm text-muted-foreground mt-1">
              Impact: {formatCurrency(totals.adjDr)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Total Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(accounts.filter(a => a.group === "Asset").reduce((sum, a) => sum + a.adjustedDebit, 0))}
            </div>
            <p className="text-sm text-primary/70 mt-1">
              Adjusted Balance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-md z-10">
              <TableRow>
                <TableHead rowSpan={2} className="w-[72px] border-r align-middle text-xs uppercase tracking-[0.08em]">Code</TableHead>
                <TableHead rowSpan={2} className="min-w-[180px] border-r align-middle text-xs uppercase tracking-[0.08em]">Account Name</TableHead>
                <TableHead colSpan={2} className="text-center border-r text-xs uppercase tracking-[0.08em]">Unadjusted</TableHead>
                <TableHead colSpan={2} className="text-center border-r bg-accent/5 text-xs uppercase tracking-[0.08em]">Adjustments</TableHead>
                <TableHead colSpan={2} className="text-center bg-primary/5 text-xs uppercase tracking-[0.08em]">Final Balance</TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="text-right w-[100px] text-xs">Debit</TableHead>
                <TableHead className="text-right border-r w-[100px] text-xs">Credit</TableHead>
                <TableHead className="text-right bg-accent/5 w-[100px] text-xs">Debit</TableHead>
                <TableHead className="text-right border-r bg-accent/5 w-[100px] text-xs">Credit</TableHead>
                <TableHead className="text-right bg-primary/5 w-[100px] text-xs">Debit</TableHead>
                <TableHead className="text-right bg-primary/5 w-[100px] text-xs">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-4 w-4 rounded-full bg-primary/20 animate-ping" />
                      <span>Loading trial balance...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {accounts.map((acc) => (
                    <TableRow key={acc.id} className="group hover:bg-muted/20 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground border-r">{acc.code}</TableCell>
                      <TableCell className="font-medium text-sm border-r">{acc.name}</TableCell>
                      
                      <TableCell className="text-right font-mono text-xs">{formatCurrency(acc.unadjustedDebit)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground border-r">{formatCurrency(acc.unadjustedCredit)}</TableCell>
                      
                      <TableCell className={`text-right font-mono text-xs bg-accent/5 ${acc.adjustmentDebit > 0 ? 'text-accent font-semibold' : 'text-muted-foreground/30'}`}>
                        {formatCurrency(acc.adjustmentDebit)}
                      </TableCell>
                      <TableCell className={`text-right font-mono text-xs border-r bg-accent/5 ${acc.adjustmentCredit > 0 ? 'text-accent font-semibold' : 'text-muted-foreground/30'}`}>
                        {formatCurrency(acc.adjustmentCredit)}
                      </TableCell>
                      
                      <TableCell className={`text-right font-mono text-xs bg-primary/5 ${acc.adjustedDebit > 0 ? 'font-semibold' : 'text-muted-foreground/30'}`}>
                        {formatCurrency(acc.adjustedDebit)}
                      </TableCell>
                      <TableCell className={`text-right font-mono text-xs bg-primary/5 ${acc.adjustedCredit > 0 ? 'font-semibold' : 'text-muted-foreground/30'}`}>
                        {formatCurrency(acc.adjustedCredit)}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Totals Row */}
                  <TableRow className="bg-muted/50 font-bold border-t-2">
                    <TableCell colSpan={2} className="text-right border-r">TOTALS</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(totals.unadjDr)}</TableCell>
                    <TableCell className="text-right font-mono border-r">{formatCurrency(totals.unadjCr)}</TableCell>
                    <TableCell className="text-right font-mono bg-accent/10 text-accent">{formatCurrency(totals.adjDr)}</TableCell>
                    <TableCell className="text-right font-mono border-r bg-accent/10 text-accent">{formatCurrency(totals.adjCr)}</TableCell>
                    <TableCell className="text-right font-mono bg-primary/10 text-primary">{formatCurrency(totals.finalDr)}</TableCell>
                    <TableCell className="text-right font-mono bg-primary/10 text-primary">{formatCurrency(totals.finalCr)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <TBUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <AdjustmentDialog open={adjOpen} onOpenChange={setAdjOpen} />
    </div>
  )
}
