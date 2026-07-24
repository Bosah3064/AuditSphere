"use client"

import * as React from "react"
import * as XLSX from "xlsx"
import { motion, AnimatePresence } from "motion/react"
import { FileSpreadsheet, Upload, Download, Table as TableIcon, Filter, Play, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

type LedgerRow = Record<string, any>

export function SamplingEngine() {
  const [file, setFile] = React.useState<File | null>(null)
  const [headers, setHeaders] = React.useState<string[]>([])
  const [ledgerData, setLedgerData] = React.useState<LedgerRow[]>([])
  const [isParsing, setIsParsing] = React.useState(false)

  // Column Mapping
  const [mapAmount, setMapAmount] = React.useState<string | null>("")
  const [mapDesc, setMapDesc] = React.useState<string | null>("")
  
  // Sampling inputs
  const [samplingMethod, setSamplingMethod] = React.useState<"random" | "mus">("random") // Simple Random or Monetary Unit Sampling
  const [confidenceLevel, setConfidenceLevel] = React.useState<string>("95")
  const [sampleSizeInput, setSampleSizeInput] = React.useState<number>(25)
  const [sampleResult, setSampleResult] = React.useState<LedgerRow[]>([])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setIsParsing(true)
    setSampleResult([])

    try {
      const buffer = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: "array" })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      
      const fileHeaders = (XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as any[] || [])
        .map(h => String(h || "").trim())
        .filter(Boolean)
      
      const rows = XLSX.utils.sheet_to_json(worksheet) as LedgerRow[]

      if (rows.length === 0) {
        throw new Error("No data rows found in sheet")
      }

      setHeaders(fileHeaders)
      setLedgerData(rows)

      // Auto map
      const amtCol = fileHeaders.find(h => h.toLowerCase().includes("amount") || h.toLowerCase() === "val" || h.toLowerCase() === "amt")
      const descCol = fileHeaders.find(h => h.toLowerCase().includes("desc") || h.toLowerCase().includes("particular") || h.toLowerCase().includes("name") || h.toLowerCase().includes("ref"))
      
      setMapAmount(amtCol || fileHeaders[0] || "")
      setMapDesc(descCol || fileHeaders[1] || fileHeaders[0] || "")

      toast.success("Ledger loaded", { description: `${rows.length} transactions ready for sampling.` })
    } catch (err: any) {
      toast.error("Failed to parse file", { description: err.message })
      setFile(null)
    } finally {
      setIsParsing(false)
    }
  }

  const generateSample = () => {
    if (ledgerData.length === 0) {
      toast.error("No ledger data", { description: "Please upload a transaction listing first." })
      return
    }

    if (samplingMethod === "random") {
      // Simple Random Selection
      const size = Math.min(sampleSizeInput, ledgerData.length)
      const shuffled = [...ledgerData].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, size)
      setSampleResult(selected)
      toast.success("Sample Generated", { description: `Successfully selected ${selected.length} random transactions.` })
    } else {
      // Monetary Unit Sampling (MUS) / Probability Proportional to Size (PPS)
      if (!mapAmount) {
        toast.error("Amount mapping required", { description: "Monetary Unit Sampling requires an Amount column mapping." })
        return
      }

      // Calculate cumulative absolute sums
      let totalAmount = 0
      const cumulativeData = ledgerData.map(row => {
        const amt = Math.abs(parseFloat(row[mapAmount]) || 0)
        totalAmount += amt
        return {
          row,
          amt,
          cumSum: totalAmount
        }
      })

      if (totalAmount === 0) {
        toast.error("Invalid amounts", { description: "Total population value must be greater than zero." })
        return
      }

      const size = Math.min(sampleSizeInput, ledgerData.length)
      const samplingInterval = totalAmount / size
      const selected: LedgerRow[] = []

      // Generate random start point between 0 and samplingInterval
      const randomStart = Math.random() * samplingInterval

      for (let i = 0; i < size; i++) {
        const targetValue = randomStart + (i * samplingInterval)
        // Find row where cumulative sum >= targetValue
        const matched = cumulativeData.find(d => d.cumSum >= targetValue)
        if (matched && !selected.some(s => s === matched.row)) {
          selected.push(matched.row)
        }
      }

      // Fill in remaining with random if selection duplicates occurred due to extreme outlier items
      if (selected.length < size) {
        const diff = size - selected.length
        const remaining = ledgerData.filter(row => !selected.includes(row))
        const extra = remaining.sort(() => 0.5 - Math.random()).slice(0, diff)
        selected.push(...extra)
      }

      setSampleResult(selected)
      toast.success("Monetary Unit Sample Generated", {
        description: `Selected ${selected.length} transactions across KES ${totalAmount.toLocaleString()} population.`
      })
    }
  }

  const exportSample = () => {
    if (sampleResult.length === 0) return

    try {
      const worksheet = XLSX.utils.json_to_sheet(sampleResult)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Sample")
      
      XLSX.writeFile(workbook, "audit_sample_selection.xlsx")
      toast.success("Excel exported successfully")
    } catch (err) {
      toast.error("Failed to export excel")
    }
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Audit Sampling & Ledger Testing Engine
        </CardTitle>
        <CardDescription>
          Upload raw transaction listings, invoices, or journal ledgers to generate audit-ready testing samples.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg bg-muted/10 p-6 text-center">
              <Upload className="h-8 w-8 text-muted-foreground/60 mb-2" />
              <Label htmlFor="ledger-upload" className="font-medium text-sm text-primary hover:underline cursor-pointer">
                {file ? file.name : "Upload ledger or transaction list"}
              </Label>
              <p className="text-xs text-muted-foreground mt-1">Excel/CSV spreadsheets</p>
              <input
                id="ledger-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
                disabled={isParsing}
              />
            </div>

            {ledgerData.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Amount Column</Label>
                  <Select value={mapAmount} onValueChange={(value) => setMapAmount(value)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description Column</Label>
                  <Select value={mapDesc} onValueChange={(value) => setMapDesc(value)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 border-l pl-0 md:pl-6 border-muted">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Sampling Method</Label>
                <Select value={samplingMethod} onValueChange={(val: any) => setSamplingMethod(val)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Simple Random</SelectItem>
                    <SelectItem value="mus">Monetary Unit (MUS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Sample Size</Label>
                <Input
                  type="number"
                  className="h-9"
                  value={sampleSizeInput}
                  onChange={(e) => setSampleSizeInput(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Confidence Level</Label>
              <Select value={confidenceLevel} onValueChange={(value) => setConfidenceLevel(value ?? "")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90% (Low Risk)</SelectItem>
                  <SelectItem value="95">95% (Medium Risk)</SelectItem>
                  <SelectItem value="99">99% (High Risk)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateSample} className="w-full h-9 mt-4 shadow-sm" disabled={ledgerData.length === 0}>
              <Play className="h-4 w-4 mr-2" />
              Generate Sample List
            </Button>
          </div>
        </div>

        {/* Results grid */}
        {sampleResult.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-4 border-t"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  Selected Sample Rows ({sampleResult.length} transactions)
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Extracted from a total population of {ledgerData.length} records.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={exportSample}>
                <Download className="h-4 w-4 mr-2" />
                Export Sample to Excel
              </Button>
            </div>

            <div className="rounded-lg border overflow-hidden max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0">
                  <TableRow>
                    {headers.slice(0, 5).map(h => (
                      <TableHead key={h} className="text-xs py-2">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleResult.map((row, i) => (
                    <TableRow key={i} className="hover:bg-muted/30">
                      {headers.slice(0, 5).map(h => (
                        <TableCell key={h} className="text-xs py-2 truncate max-w-[150px]">
                          {row[h] !== undefined ? String(row[h]) : "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
