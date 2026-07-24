"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Plus, Search, FileText, Settings2, Trash2, Edit } from "lucide-react"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useWorkpaperStore } from "@/store/workpaper-store"
import { WorkpaperFormDialog } from "@/components/workpapers/workpaper-form-dialog"
import { format } from "date-fns"

export default function WorkpapersPage() {
  const { workpapers, fetchWorkpapers, deleteWorkpaper, isLoading } = useWorkpaperStore()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    fetchWorkpapers()
  }, [fetchWorkpapers])

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this workpaper? This action cannot be undone.")) {
      await deleteWorkpaper(id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Signed Off":
        return "bg-green-500/15 text-green-700 hover:bg-green-500/25"
      case "In Review":
        return "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25"
      case "Draft":
      default:
        return "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25"
    }
  }

  const filteredWorkpapers = workpapers.filter(w => 
    w.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 h-full">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workpapers</h2>
          <p className="text-muted-foreground">Document audit fieldwork, attach evidence, and sign off.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Workpaper
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workpapers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Settings2 className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workpaper Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Loading workpapers...
                  </TableCell>
                </TableRow>
              ) : filteredWorkpapers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No workpapers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkpapers.map((wp) => (
                  <TableRow key={wp.id}>
                    <TableCell className="font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      {wp.title}
                    </TableCell>
                    <TableCell>
                      <Badge className={`font-normal ${getStatusColor(wp.status)}`} variant="outline">
                        {wp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {wp.createdAt ? format(new Date(wp.createdAt), "MMM d, yyyy") : "Unknown"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0" })}>
                          <span className="sr-only">Open menu</span>
                          <Settings2 className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => window.location.href = `/workpapers/${wp.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Document
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => handleDelete(wp.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <WorkpaperFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  )
}
