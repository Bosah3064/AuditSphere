import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface PBCRequest {
  id: string
  clientName: string
  title: string
  description: string
  dueDate: string
  status: "Requested" | "Submitted" | "Approved" | "Rejected"
  assignedTo: string
  fileName?: string
  fileSize?: string
  uploadedAt?: string
  organization_id?: string
}

interface PBCState {
  requests: PBCRequest[]
  isLoading: boolean
  fetchRequests: () => Promise<void>
  addRequest: (request: Omit<PBCRequest, "id" | "status">) => Promise<void>
  submitDocument: (id: string, fileName: string, fileSize: string) => Promise<void>
  updateStatus: (id: string, status: PBCRequest["status"]) => Promise<void>
}

const mockRequests: PBCRequest[] = [
  {
    id: "pbc1",
    clientName: "Safaricom PLC",
    title: "Q3 Board Meeting Minutes",
    description: "Approved minutes of the Board of Directors meetings held during Q3 2026.",
    dueDate: "2026-07-15",
    status: "Submitted",
    assignedTo: "Company Secretary",
    fileName: "Safaricom_Q3_Board_Minutes_Signed.pdf",
    fileSize: "4.2 MB",
    uploadedAt: "2026-07-01"
  },
  {
    id: "pbc2",
    clientName: "Equity Group Holdings",
    title: "KRA Tax Compliance Certificate",
    description: "Valid Tax Compliance Certificate from Kenya Revenue Authority for the current fiscal year.",
    dueDate: "2026-07-10",
    status: "Approved",
    assignedTo: "Tax Director",
    fileName: "Equity_KRA_TCC_2026.pdf",
    fileSize: "1.1 MB",
    uploadedAt: "2026-06-28"
  },
  {
    id: "pbc3",
    clientName: "Safaricom PLC",
    title: "M-Pesa Reconciliation Report",
    description: "End of month reconciliation statement for M-Pesa trust accounts.",
    dueDate: "2026-07-22",
    status: "Requested",
    assignedTo: "Finance Operations Lead"
  },
  {
    id: "pbc4",
    clientName: "Kenya Airways",
    title: "Aircraft Lease Agreements",
    description: "Signed lease documentation for the 3 new Boeing 787 Dreamliners.",
    dueDate: "2026-07-05",
    status: "Rejected",
    assignedTo: "Legal Counsel",
    fileName: "Draft_Lease_Agreements.pdf",
    fileSize: "12.5 MB",
    uploadedAt: "2026-06-30"
  }
]

const supabase = createClient()

export const usePBCStore = create<PBCState>((set) => ({
  requests: [],
  isLoading: false,

  fetchRequests: async () => {
    set({ isLoading: true })
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data, error } = await supabase
        .from('pbc_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedData = (data || []).map(d => ({
        id: d.id,
        clientName: d.client_name,
        title: d.title,
        description: d.description || "",
        dueDate: d.due_date || "",
        status: d.status || "Requested",
        assignedTo: d.assigned_to || "",
        fileName: d.file_name,
        fileSize: d.file_size,
        uploadedAt: d.uploaded_at ? d.uploaded_at.split('T')[0] : undefined,
        organization_id: d.organization_id
      }))
      if (typeof window !== "undefined") {
        localStorage.setItem('pbc_requests_cache', JSON.stringify(formattedData))
      }
      set({ requests: formattedData as PBCRequest[], isLoading: false })
    } catch (err) {
      console.warn("Supabase query failed, trying to read PBC requests from cache:", err)
      let cached = null
      if (typeof window !== "undefined") {
        cached = localStorage.getItem('pbc_requests_cache')
      }
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          set({ requests: parsed, isLoading: false })
          return
        } catch (parseErr) {
          console.error("Error parsing PBC requests cache", parseErr)
        }
      }
      // Fall back to seed data
      console.warn("Using seed PBC requests data (no auth session or query failed and no cache)")
      set({ requests: mockRequests, isLoading: false })
    }
  },

  addRequest: async (request) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userData.user.id)
        .single()

      const newReq: Record<string, string | null> = {
        client_name: request.clientName,
        title: request.title,
        description: request.description,
        due_date: request.dueDate,
        status: 'Requested',
        assigned_to: request.assignedTo,
        organization_id: profile?.organization_id || null
      }

      const { data, error } = await supabase
        .from('pbc_requests')
        .insert([newReq])
        .select()
        .single()

      if (error) throw error

      const formattedData = {
        id: data.id,
        clientName: data.client_name,
        title: data.title,
        description: data.description,
        dueDate: data.due_date,
        status: data.status,
        assignedTo: data.assigned_to,
        organization_id: data.organization_id
      } as PBCRequest

      set((state) => {
        const newReqs = [formattedData, ...state.requests]
        if (typeof window !== "undefined") {
          localStorage.setItem('pbc_requests_cache', JSON.stringify(newReqs))
        }
        return { requests: newReqs }
      })
      toast.success("Request sent to client")
    } catch {
      const newReq: PBCRequest = {
        ...request,
        id: `pbc${Date.now()}`,
        status: "Requested"
      }
      set((state) => {
        const newReqs = [newReq, ...state.requests]
        if (typeof window !== "undefined") {
          localStorage.setItem('pbc_requests_cache', JSON.stringify(newReqs))
        }
        return { requests: newReqs }
      })
      toast.success("Request sent (Local)")
    }
  },

  submitDocument: async (id, fileName, fileSize) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { error } = await supabase
        .from('pbc_requests')
        .update({ 
          status: 'Submitted',
          file_name: fileName,
          file_size: fileSize,
          uploaded_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      set((state) => {
        const newReqs = state.requests.map(req => 
          req.id === id 
            ? { 
                ...req, 
                status: "Submitted" as const, 
                fileName, 
                fileSize, 
                uploadedAt: new Date().toISOString().split('T')[0] 
              } 
            : req
        )
        if (typeof window !== "undefined") {
          localStorage.setItem('pbc_requests_cache', JSON.stringify(newReqs))
        }
        return { requests: newReqs }
      })
      toast.success("Document submitted")
    } catch {
      set((state) => {
        const newReqs = state.requests.map(req => 
          req.id === id 
            ? { 
                ...req, 
                status: "Submitted" as const, 
                fileName, 
                fileSize, 
                uploadedAt: new Date().toISOString().split('T')[0] 
              } 
            : req
        )
        if (typeof window !== "undefined") {
          localStorage.setItem('pbc_requests_cache', JSON.stringify(newReqs))
        }
        return { requests: newReqs }
      })
      toast.success("Document submitted (Local)")
    }
  },

  updateStatus: async (id, status) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { error } = await supabase
        .from('pbc_requests')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      set((state) => {
        const newReqs = state.requests.map(req => 
          req.id === id ? { ...req, status } : req
        )
        if (typeof window !== "undefined") {
          localStorage.setItem('pbc_requests_cache', JSON.stringify(newReqs))
        }
        return { requests: newReqs }
      })
      toast.success(`Request marked as ${status}`)
    } catch {
      set((state) => {
        const newReqs = state.requests.map(req => 
          req.id === id ? { ...req, status } : req
        )
        if (typeof window !== "undefined") {
          localStorage.setItem('pbc_requests_cache', JSON.stringify(newReqs))
        }
        return { requests: newReqs }
      })
      toast.success(`Status updated (Local)`)
    }
  }
}))
