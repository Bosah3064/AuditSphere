"use client"

import * as React from "react"
import { Plus, LayoutGrid, List, Bot, Filter, Search } from "lucide-react"
import { motion } from "motion/react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FindingsBoard } from "@/components/findings/findings-board"
import { useFindingStore, Finding } from "@/store/finding-store"
import { FindingFormDialog } from "@/components/findings/finding-form-dialog"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function FindingsPage() {
  const { findings, fetchFindings } = useFindingStore()
  const [view, setView] = React.useState<"board" | "table">("board")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [findingToEdit, setFindingToEdit] = React.useState<Finding | null>(null)

  React.useEffect(() => {
    fetchFindings()
  }, [fetchFindings])

  const handleCreate = () => {
    setFindingToEdit(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-full space-y-6">
      <FindingFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        findingToEdit={findingToEdit}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Findings</h2>
          <p className="text-muted-foreground">
            Track and remediate audit findings across all engagements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger className={buttonVariants({ variant: "outline", className: "border-accent text-accent hover:bg-accent/10" })}>
              <Bot className="mr-2 h-4 w-4" />
              AI Generate
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>AI Finding Generator</DialogTitle>
                <DialogDescription>
                  Describe the issue you found or paste evidence text. The AI will generate a standardized finding with risk rating, criteria, condition, and recommendation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Textarea 
                  placeholder="e.g. I reviewed the Q3 access logs and noticed 3 terminated employees still had active accounts in the financial system for up to 14 days after their departure date."
                  className="min-h-[150px]"
                />
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button className="bg-accent hover:bg-accent/90 text-white">Generate Draft</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleCreate} className={buttonVariants({ className: "shadow-md" })}>
            <Plus className="mr-2 h-4 w-4" />
            New Finding
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search findings..."
              className="pl-8 w-[250px] lg:w-[300px]"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs value={view} onValueChange={(v) => setView(v as "board" | "table")}>
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="board" className="px-3">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Board
            </TabsTrigger>
            <TabsTrigger value="table" className="px-3">
              <List className="h-4 w-4 mr-2" />
              Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden min-h-0 relative">
        {view === "board" ? (
          <div className="absolute inset-0 overflow-y-auto overflow-x-auto pb-4">
            <FindingsBoard 
              findings={findings} 
              onEdit={(finding) => {
                setFindingToEdit(finding)
                setIsDialogOpen(true)
              }}
              onDelete={(id) => {
                if (window.confirm("Are you sure you want to delete this finding?")) {
                  useFindingStore.getState().deleteFinding(id)
                }
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 border rounded-xl border-dashed glass-card">
            <div className="text-center space-y-2">
              <List className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="font-medium text-lg">Table View</h3>
              <p className="text-sm text-muted-foreground">The data table view will be implemented in a future phase.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
