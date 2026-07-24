"use client"

import * as React from "react"
import { Inbox, Plus, FileUp, CheckCircle, XCircle, Clock, ExternalLink, Download, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePBCStore, PBCRequest } from "@/store/pbc-store"
import { toast } from "sonner"

export default function PBCRequestsPage() {
  const { requests, fetchRequests, updateStatus, submitDocument, isLoading } = usePBCStore()
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const getStatusBadge = (status: PBCRequest["status"]) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>
      case "Rejected":
        return <Badge variant="destructive" className="bg-destructive/15 text-destructive border-destructive/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>
      case "Submitted":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20"><Clock className="w-3 h-3 mr-1" /> Submitted</Badge>
      case "Requested":
      default:
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Requested</Badge>
    }
  }

  const handleApprove = (id: string) => {
    updateStatus(id, "Approved")
    toast.success("Document Approved", { description: "The evidence has been mapped to the audit workpapers." })
  }

  const handleReject = (id: string) => {
    updateStatus(id, "Rejected")
    toast.error("Document Rejected", { description: "The client has been notified to re-submit." })
  }

  const handleSimulateUpload = (id: string) => {
    submitDocument(id, "Safaricom_MPESA_Trust_Reconciliation_Q3.pdf", "8.4 MB")
    toast.success("Document Uploaded", { description: "Client successfully submitted the requested file." })
  }

  const filteredRequests = requests.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">PBC Request Portal</h2>
          <p className="text-muted-foreground">
            Manage Prepared-by-Client (PBC) document requests and client audit evidence.
          </p>
        </div>
        <Button className="shadow-md">
          <Plus className="mr-2 h-4 w-4" />
          Request Document
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-500">Pending Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{requests.filter(r => r.status === "Requested").length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-500">Awaiting Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{requests.filter(r => r.status === "Submitted").length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-500">Approved Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{requests.filter(r => r.status === "Approved").length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 rounded-xl border glass-card overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-md z-10">
              <TableRow>
                <TableHead className="w-[180px]">Client</TableHead>
                <TableHead className="w-[220px]">Requested Document</TableHead>
                <TableHead className="w-[120px]">Due Date</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[200px]">Attached File</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading requests...
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => (
                  <TableRow key={req.id} className="group hover:bg-muted/20 transition-colors">
                    <TableCell className="font-semibold">{req.clientName}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{req.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{req.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{req.dueDate}</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell>
                      {req.fileName ? (
                        <div className="flex items-center space-x-1.5 text-xs text-primary font-medium hover:underline cursor-pointer">
                          <FileText className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[150px]">{req.fileName}</span>
                          <span className="text-[10px] text-muted-foreground">({req.fileSize})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No file attached</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {req.status === "Requested" && (
                          <Button size="sm" variant="outline" className="h-8" onClick={() => handleSimulateUpload(req.id)}>
                            <FileUp className="w-3.5 h-3.5 mr-1" /> Upload
                          </Button>
                        )}
                        {req.status === "Submitted" && (
                          <>
                            <Button size="sm" variant="outline" className="h-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => handleApprove(req.id)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/5" onClick={() => handleReject(req.id)}>
                              Reject
                            </Button>
                          </>
                        )}
                        {req.fileName && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Download Document">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
