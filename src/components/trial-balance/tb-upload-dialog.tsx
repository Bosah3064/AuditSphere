"use client"

import * as React from "react"
import * as XLSX from "xlsx"
import { motion, AnimatePresence } from "motion/react"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTBStore, TBAccount } from "@/store/tb-store"
import { toast } from "sonner"

interface TBUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ParsedRow = Record<string, any>

const normalizeHeader = (header: string) => String(header || "").trim()
const parseNumericValue = (value: unknown) => {
  let raw = String(value ?? "").replace(/\u00A0/g, "").trim()
  raw = raw.replace(/\((.*)\)/, "-$1")
  raw = raw.replace(/[^0-9.\-()]/g, "")
  raw = raw.replace(/,/g, "")
  const parsed = parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

export function TBUploadDialog({ open, onOpenChange }: TBUploadDialogProps) {
  const [step, setStep] = React.useState<"upload" | "map" | "success">("upload")
  const [file, setFile] = React.useState<File | null>(null)
  const [headers, setHeaders] = React.useState<string[]>([])
  const [data, setData] = React.useState<ParsedRow[]>([])
  const [isParsing, setIsParsing] = React.useState(false)

  // Mapping state
  const [mapCode, setMapCode] = React.useState<string>("")
  const [mapName, setMapName] = React.useState<string>("")
  const [mapDebit, setMapDebit] = React.useState<string>("")
  const [mapCredit, setMapCredit] = React.useState<string>("")

  const setAccounts = useTBStore(state => state.setAccounts)

  const resetState = () => {
    setStep("upload")
    setFile(null)
    setHeaders([])
    setData([])
    setMapCode("")
    setMapName("")
    setMapDebit("")
    setMapCredit("")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setIsParsing(true)

    try {
      const buffer = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: "array" })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      
      const sheetRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][]
      if (sheetRows.length < 1) {
        throw new Error("File must contain at least one row of data.")
      }

      const normalizeRow = (row: any[]) => row.map((cell) => String(cell ?? "").trim())
      const isHeaderRow = (row: any[]) => {
        const normalized = normalizeRow(row).map(value => value.toLowerCase())
        const headerKeywords = ["code", "acc", "account", "name", "description", "desc", "debit", "credit", "dr", "cr", "amount", "balance"]
        return normalized.some(value => headerKeywords.some(keyword => value.includes(keyword)))
      }

      let headerRowIndex = sheetRows.findIndex((row, index) => {
        if (index > 9) return false
        return isHeaderRow(row)
      })

      let fileHeaders: string[]
      let dataRows: any[][]

      if (headerRowIndex >= 0) {
        fileHeaders = sheetRows[headerRowIndex].map((header, index) => {
          const normalized = normalizeHeader(String(header))
          return normalized || `Column ${index + 1}`
        })
        dataRows = sheetRows.slice(headerRowIndex + 1)
      } else {
        const firstRowIsHeader = sheetRows[0].every((cell) => typeof cell === "string" && String(cell).trim() !== "")
        if (firstRowIsHeader) {
          fileHeaders = sheetRows[0].map((header, index) => {
            const normalized = normalizeHeader(String(header))
            return normalized || `Column ${index + 1}`
          })
          dataRows = sheetRows.slice(1)
        } else {
          const columnCount = Math.max(...sheetRows.map((row) => row.length))
          fileHeaders = Array.from({ length: columnCount }, (_, index) => `Column ${index + 1}`)
          dataRows = sheetRows
        }
      }

      dataRows = dataRows.filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))

      const rowData = dataRows.map((row) => {
        const normalized: ParsedRow = {}
        fileHeaders.forEach((header, index) => {
          normalized[header] = row[index] ?? ""
        })
        return normalized
      })

      if (rowData.length === 0) {
        throw new Error("No usable rows were found after headers.")
      }

      setHeaders(fileHeaders)
      setData(rowData)

      const hLow = fileHeaders.map(h => h.toLowerCase())
      const findBestMatch = (keywords: string[]) => {
        const index = hLow.findIndex(h => keywords.some(k => h.includes(k)))
        return index >= 0 ? fileHeaders[index] : ""
      }

      const detectColumnTypes = () => {
        const samples = rowData.slice(0, 10)
        return fileHeaders.map((header) => {
          let numeric = 0
          let text = 0
          samples.forEach((row) => {
            const value = row[header]
            const str = String(value ?? "").trim()
            if (str === "") return
            const num = Number(str.replace(/,/g, ""))
            if (!Number.isNaN(num)) numeric += 1
            else text += 1
          })
          return { header, numeric, text }
        })
      }

      const columnTypes = detectColumnTypes()
      const numericHeaders = columnTypes.filter(c => c.numeric > 0).map(c => c.header)
      const textHeaders = columnTypes.filter(c => c.text >= c.numeric).map(c => c.header)

      const suggestedName = findBestMatch(["name", "desc", "account", "particular", "narration"]) || textHeaders[0] || fileHeaders[0]
      let suggestedCode = findBestMatch(["code", "acc", "no", "number"]);
      if (!suggestedCode) {
        suggestedCode = fileHeaders.find((h) => h !== suggestedName && !numericHeaders.includes(h)) || fileHeaders[0]
      }
      const suggestedAmount = findBestMatch(["amount", "balance", "total", "value", "net"])
      const suggestedDebit = findBestMatch(["debit", "dr"]) || suggestedAmount || numericHeaders[0] || fileHeaders[1] || fileHeaders[0]
      const suggestedCredit = findBestMatch(["credit", "cr"]) || suggestedAmount || numericHeaders[1] || numericHeaders[0] || fileHeaders[2] || fileHeaders[1] || fileHeaders[0]

      setMapCode(suggestedCode)
      setMapName(suggestedName)
      setMapDebit(suggestedDebit)
      setMapCredit(suggestedCredit)

      setStep("map")
    } catch (err: any) {
      toast.error("Failed to parse file", { description: err.message })
      resetState()
    } finally {
      setIsParsing(false)
    }
  }

  const handleImport = () => {
    if (!mapCode || !mapName || !mapDebit || !mapCredit) {
      toast.error("Missing mapping", { description: "Please map all required fields." })
      return
    }

    try {
      const singleAmountColumn = mapDebit === mapCredit

      const importedAccounts: TBAccount[] = data
        .filter((row) => {
          const code = String(row[mapCode] ?? "").trim()
          const name = String(row[mapName] ?? "").trim()
          return code !== "" || name !== ""
        })
        .map((row, index) => {
          let rawDr = 0
          let rawCr = 0
          if (singleAmountColumn) {
            const amount = parseNumericValue(row[mapDebit])
            rawDr = amount >= 0 ? amount : 0
            rawCr = amount < 0 ? Math.abs(amount) : 0
          } else {
            rawDr = parseNumericValue(row[mapDebit])
            rawCr = parseNumericValue(row[mapCredit])
          }

          const accountCodeValue = String(row[mapCode] ?? "").trim()
          const accountNameValue = String(row[mapName] ?? "").trim()
          const accountName = accountNameValue || accountCodeValue || `Imported Account ${index + 1}`
          const accountCode = accountCodeValue || (mapCode === mapName ? `ACC-${index + 1}` : accountName)
          const codePrefix = accountCode.charAt(0)
          let group: TBAccount["group"] = "Asset"
          if (codePrefix === "2") group = "Liability"
          if (codePrefix === "3") group = "Equity"
          if (codePrefix === "4") group = "Revenue"
          if (codePrefix === "5" || codePrefix === "6") group = "Expense"

          return {
            id: `imported-${index}-${Date.now()}`,
            code: accountCode,
            name: accountName,
            unadjustedDebit: rawDr,
            unadjustedCredit: rawCr,
            adjustmentDebit: 0,
            adjustmentCredit: 0,
            adjustedDebit: rawDr,
            adjustedCredit: rawCr,
            group
          }
        })

      setAccounts(importedAccounts)
      setStep("success")
      toast.success("Trial balance imported successfully")
      
      setTimeout(() => {
        onOpenChange(false)
        setTimeout(resetState, 500)
      }, 2000)

    } catch (err: any) {
      toast.error("Import failed", { description: "There was an error importing the mapped data." })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val)
      if (!val) setTimeout(resetState, 500)
    }}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl">Upload Trial Balance</DialogTitle>
            <DialogDescription>
              Import your client's raw Excel or CSV trial balance data.
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {step === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-12 text-center"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  {isParsing ? (
                    <AlertCircle className="h-8 w-8 text-primary animate-pulse" />
                  ) : (
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">Drag & Drop or Browse</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  Supports .xlsx, .xls, and .csv files. We'll automatically try to map the columns.
                </p>
                <Label
                  htmlFor="tb-file-upload"
                  className={`inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 cursor-pointer ${isParsing ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {isParsing ? "Parsing..." : "Select File"}
                </Label>
                <input
                  id="tb-file-upload"
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isParsing}
                />
              </motion.div>
            )}

            {step === "map" && (
              <motion.div
                key="map"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium text-sm">File Parsed Successfully</h4>
                    <p className="text-xs text-muted-foreground">{data.length} rows detected. Please confirm the column mapping.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Account Code Column</Label>
                      <Select value={mapCode} onValueChange={(val) => setMapCode(val || "")}>
                        <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                        <SelectContent>
                          {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Account Name Column</Label>
                      <Select value={mapName} onValueChange={(val) => setMapName(val || "")}>
                        <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                        <SelectContent>
                          {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Unadjusted Debit Column</Label>
                      <Select value={mapDebit} onValueChange={(val) => setMapDebit(val || "")}>
                        <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                        <SelectContent>
                          {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Unadjusted Credit Column</Label>
                      <Select value={mapCredit} onValueChange={(val) => setMapCredit(val || "")}>
                        <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                        <SelectContent>
                          {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={resetState}>Cancel</Button>
                  <Button onClick={handleImport}>
                    Import Data <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Import Complete</h3>
                <p className="text-muted-foreground max-w-sm">
                  {data.length} accounts have been successfully loaded into the working trial balance.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
