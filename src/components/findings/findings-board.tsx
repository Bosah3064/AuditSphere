"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { FindingCard } from "./finding-card"
import { Finding } from "@/store/finding-store"

interface FindingsBoardProps {
  findings: Finding[]
  onEdit?: (finding: Finding) => void
  onDelete?: (id: string) => void
}

const columns = [
  { id: "draft", title: "Draft", status: "Draft" },
  { id: "open", title: "Open", status: "Open" },
  { id: "response", title: "Management Response", status: "Management Response" },
  { id: "remediation", title: "In Remediation", status: "In Remediation" },
]

export function FindingsBoard({ findings, onEdit, onDelete }: FindingsBoardProps) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-full min-h-[500px]">
      {columns.map((column, index) => {
        const columnFindings = findings.filter(
          (f) => f.status.toLowerCase() === column.status.toLowerCase()
        )
        
        return (
          <div key={column.id} className="flex flex-col w-80 shrink-0">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {columnFindings.length}
              </span>
            </div>
            
            <div className="flex-1 bg-muted/30 rounded-xl p-3 border border-dashed flex flex-col gap-3 min-h-[200px]">
              <AnimatePresence>
                {columnFindings.map((finding, i) => (
                  <motion.div
                    key={finding.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 + i * 0.05 }}
                  >
                    <FindingCard finding={finding} onEdit={onEdit} onDelete={onDelete} />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {columnFindings.length === 0 && (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground italic">
                  No findings
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
