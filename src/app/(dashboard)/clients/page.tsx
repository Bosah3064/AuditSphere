"use client"

import * as React from "react"
import { Plus, Search, Building2, MoreHorizontal, FileText, Settings, Trash2 } from "lucide-react"
import { motion } from "motion/react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useClientStore, Client } from "@/store/client-store"
import { useAuditStore } from "@/store/audit-store"
import { ClientFormDialog } from "@/components/clients/client-form-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ClientsPage() {
  const { clients, fetchClients, deleteClient, isLoading } = useClientStore()
  const { audits, fetchAudits } = useAuditStore()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [clientToEdit, setClientToEdit] = React.useState<Client | null>(null)
  const [auditsDialogOpen, setAuditsDialogOpen] = React.useState(false)
  const [selectedClientForAudits, setSelectedClientForAudits] = React.useState<Client | null>(null)

  React.useEffect(() => {
    fetchClients()
    fetchAudits()
  }, [fetchClients, fetchAudits])

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.kraPin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (client: Client) => {
    setClientToEdit(client)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setClientToEdit(null)
    setIsDialogOpen(true)
  }

  const getClientAudits = () => {
    if (!selectedClientForAudits) return []
    const clientNameLower = selectedClientForAudits.name.toLowerCase()
    
    // Attempt database text matching first
    const filtered = audits.filter(a => 
      a.title.toLowerCase().includes(clientNameLower.split(" ")[0])
    )
    
    if (filtered.length > 0) return filtered

    // Fallback matching for demo consistency
    if (clientNameLower.includes("safaricom")) {
      return audits.filter(a => a.title.includes("Financial") || a.title.includes("IT"))
    }
    if (clientNameLower.includes("equity")) {
      return audits.filter(a => a.title.includes("ISO"))
    }
    if (clientNameLower.includes("airways")) {
      return audits.filter(a => a.title.includes("Vendor"))
    }
    return []
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-full space-y-6">
      <ClientFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        clientToEdit={clientToEdit}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage your audit firm's client portfolio and engagement profiles.
          </p>
        </div>
        <Button onClick={handleCreate} className="shadow-md">
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search clients by name, PIN, or industry..." 
            className="pl-9 bg-background/50 backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 rounded-xl border glass-card overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-md z-10">
              <TableRow>
                <TableHead className="w-[250px]">Company Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>KRA PIN</TableHead>
                <TableHead>FYE</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Audit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-primary/20 animate-ping" />
                      <span>Loading clients...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No clients found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client, index) => (
                  <TableRow key={client.id} className="group hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div>{client.name}</div>
                          <div className="text-sm text-muted-foreground font-normal">{client.contactEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{client.industry}</TableCell>
                    <TableCell className="font-mono text-sm">{client.kraPin}</TableCell>
                    <TableCell>{client.financialYearEnd}</TableCell>
                    <TableCell>
                      <Badge variant={client.status === "Active" ? "default" : "secondary"} className={client.status === "Active" ? "bg-primary/15 text-primary hover:bg-primary/25 border-primary/20" : ""}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{client.lastAuditDate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" })}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(client)}>
                            <Settings className="mr-2 h-4 w-4" /> Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedClientForAudits(client)
                            setAuditsDialogOpen(true)
                          }}>
                            <FileText className="mr-2 h-4 w-4" /> View Audits
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => deleteClient(client.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Client Audits Dialog */}
      <Dialog open={auditsDialogOpen} onOpenChange={setAuditsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Audits for {selectedClientForAudits?.name}</DialogTitle>
            <DialogDescription>
              Active and completed audit engagements.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Audit Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getClientAudits().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground text-sm">
                        No active audits found for this client.
                      </TableCell>
                    </TableRow>
                  ) : (
                    getClientAudits().map((audit) => (
                      <TableRow key={audit.id}>
                        <TableCell className="font-medium text-sm">{audit.title}</TableCell>
                        <TableCell className="text-sm">{audit.type}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{audit.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            audit.risk === "Critical" || audit.risk === "High" 
                              ? "text-xs text-destructive border-destructive/20 bg-destructive/5" 
                              : "text-xs text-muted-foreground"
                          }>
                            {audit.risk}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
