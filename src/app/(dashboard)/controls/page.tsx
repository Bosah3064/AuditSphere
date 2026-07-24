"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Plus, Search, CheckSquare, Settings2, Trash2 } from "lucide-react"

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
import { useControlStore, type Control } from "@/store/control-store"
import { ControlFormDialog } from "@/components/controls/control-form-dialog"

export default function ControlsPage() {
  const { controls, fetchControls, deleteControl, isLoading } = useControlStore()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [controlToEdit, setControlToEdit] = React.useState<Control | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    fetchControls()
  }, [fetchControls])

  const handleCreate = () => {
    setControlToEdit(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (control: Control) => {
    setControlToEdit(control)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this control?")) {
      await deleteControl(id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Effective":
        return "bg-green-500/15 text-green-700 hover:bg-green-500/25"
      case "Ineffective":
        return "bg-red-500/15 text-red-700 hover:bg-red-500/25"
      case "Not Tested":
      default:
        return "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25"
    }
  }

  const filteredControls = controls.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.owner.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 h-full">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Controls Management</h2>
          <p className="text-muted-foreground">Manage and test your organization's internal controls.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Control
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
              placeholder="Search controls..."
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
                <TableHead>Control Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Loading controls...
                  </TableCell>
                </TableRow>
              ) : filteredControls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No controls found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredControls.map((control) => (
                  <TableRow key={control.id}>
                    <TableCell className="font-medium">{control.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{control.type}</Badge>
                    </TableCell>
                    <TableCell>{control.frequency}</TableCell>
                    <TableCell>{control.owner}</TableCell>
                    <TableCell>
                      <Badge className={`font-normal ${getStatusColor(control.status)}`} variant="outline">
                        {control.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0" })}>
                          <span className="sr-only">Open menu</span>
                          <CheckSquare className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(control)}>
                              Edit Control
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => handleDelete(control.id)}
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

      <ControlFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        controlToEdit={controlToEdit} 
      />
    </div>
  )
}
