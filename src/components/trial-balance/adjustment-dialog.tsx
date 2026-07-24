"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Plus, Trash, Calculator, CheckCircle2, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTBStore } from "@/store/tb-store"
import { toast } from "sonner"

interface AdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface AdjustmentLine {
  accountId: string
  debit: number
  credit: number
}

export function AdjustmentDialog({ open, onOpenChange }: AdjustmentDialogProps) {
  const { accounts, addAdjustment } = useTBStore()
  const [lines, setLines] = React.useState<AdjustmentLine[]>([
    { accountId: "", debit: 0, credit: 0 },
    { accountId: "", debit: 0, credit: 0 },
  ])

  const addLine = () => {
    setLines([...lines, { accountId: "", debit: 0, credit: 0 }])
  }

  const removeLine = (index: number) => {
    if (lines.length <= 2) {
      toast.error("An adjustment entry must have at least 2 lines.")
      return
    }
    setLines(lines.filter((_, i) => i !== index))
  }

  const updateLine = (index: number, field: keyof AdjustmentLine, value: any) => {
    setLines(lines.map((line, i) => {
      if (i !== index) return line
      
      const updated = { ...line, [field]: value }
      
      // If setting debit > 0, reset credit to 0 (and vice versa) to prevent double entry on same line
      if (field === "debit" && value > 0) {
        updated.credit = 0
      } else if (field === "credit" && value > 0) {
        updated.debit = 0
      }

      return updated
    }))
  }

  // Calculate totals
  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0)
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0)
  const difference = Math.abs(totalDebit - totalCredit)
  const isBalanced = totalDebit > 0 && difference === 0

  const handlePost = async () => {
    if (!isBalanced) {
      toast.error("Unbalanced entry", { description: "Total Debits must equal Total Credits before posting." })
      return
    }

    if (lines.some(l => !l.accountId)) {
      toast.error("Incomplete lines", { description: "Please select an account for all lines." })
      return
    }

    try {
      // Post all lines to store
      for (const line of lines) {
        await addAdjustment(line.accountId, line.debit, line.credit)
      }
      
      toast.success("Adjustment journal entry posted successfully!")
      onOpenChange(false)
      setLines([
        { accountId: "", debit: 0, credit: 0 },
        { accountId: "", debit: 0, credit: 0 },
      ])
    } catch (err) {
      toast.error("Failed to post adjustment")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            New Adjusting Journal Entry
          </DialogTitle>
          <DialogDescription>
            Record adjusting journal entries (AJEs) to correct misstatements in the working trial balance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
          {lines.map((line, index) => (
            <div key={index} className="flex gap-3 items-end">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Account</Label>
                <Select
                  value={line.accountId}
                  onValueChange={(val) => updateLine(index, "accountId", val)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.code} - {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[120px] space-y-1.5">
                <Label className="text-xs font-mono">Debit (KES)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  className="h-9 font-mono"
                  value={line.debit || ""}
                  onChange={(e) => updateLine(index, "debit", parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="w-[120px] space-y-1.5">
                <Label className="text-xs font-mono">Credit (KES)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  className="h-9 font-mono"
                  value={line.credit || ""}
                  onChange={(e) => updateLine(index, "credit", parseFloat(e.target.value) || 0)}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => removeLine(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addLine} className="mt-2 w-max">
          <Plus className="h-4 w-4 mr-2" /> Add Journal Line
        </Button>

        {/* Totals & Balancing Section */}
        <div className="mt-6 border-t pt-4 space-y-4">
          <div className="grid grid-cols-3 text-sm font-semibold p-3 rounded-lg bg-muted/40">
            <div className="text-muted-foreground">TOTALS:</div>
            <div className="font-mono text-primary text-right pr-6">Dr: KES {totalDebit.toLocaleString()}</div>
            <div className="font-mono text-primary text-right pr-6">Cr: KES {totalCredit.toLocaleString()}</div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Journal entry is balanced.
                </span>
              ) : (
                <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> Out of balance by KES {difference.toLocaleString()}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handlePost} disabled={!isBalanced}>Post Entry</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
