"use client"

import * as React from "react"
import { Plus, LayoutGrid, List } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuditCard } from "@/components/audits/audit-card"
import { AuditTable } from "@/components/audits/audit-table"
import { useAuditStore, Audit } from "@/store/audit-store"
import { AuditFormDialog } from "@/components/audits/audit-form-dialog"

export default function AuditsPage() {
  const { audits, fetchAudits, deleteAudit } = useAuditStore()
  const [view, setView] = React.useState<"grid" | "table">("grid")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [auditToEdit, setAuditToEdit] = React.useState<Audit | null>(null)

  React.useEffect(() => {
    fetchAudits()
  }, [fetchAudits])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const handleCreate = () => {
    setAuditToEdit(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to archive this audit?")) {
      await deleteAudit(id)
    }
  }

  return (
    <div className="flex-1 space-y-6">
      <AuditFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        auditToEdit={auditToEdit} 
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Audits</h2>
          <p className="text-muted-foreground">
            Manage your audit engagements and track progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "table")} className="hidden sm:block">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="grid" className="px-3">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="table" className="px-3">
                <List className="h-4 w-4 mr-2" />
                Table
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Audit
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "grid" ? (
          <motion.div
            key="grid"
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {audits.map((audit) => (
              <motion.div key={audit.id} variants={item}>
                <AuditCard audit={audit} onDelete={handleDelete} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <AuditTable data={audits} onDelete={(audit) => handleDelete(audit.id)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
