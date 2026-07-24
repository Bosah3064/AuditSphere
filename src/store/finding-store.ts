import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export interface Finding {
  id: string
  auditId: string
  title: string
  severity: "Critical" | "High" | "Medium" | "Low"
  status: "Draft" | "Open" | "Management Response" | "In Remediation" | "Closed"
  owner: string
  dueDate: string
  description?: string
  organization_id?: string
}

interface FindingState {
  findings: Finding[]
  isLoading: boolean
  fetchFindings: () => Promise<void>
  addFinding: (finding: Omit<Finding, "id">) => Promise<void>
  updateFinding: (id: string, finding: Partial<Finding>) => Promise<void>
  deleteFinding: (id: string) => Promise<void>
}

const supabase = createClient()

const seedFindings: Finding[] = [
  { id: 'F-001', auditId: 'A-001', title: 'Segregation of Duties Weakness in AP', severity: 'High', status: 'Open', owner: 'Sarah Kimani', dueDate: '2026-08-01', description: 'The same individual can create and approve purchase orders without secondary authorization.' },
  { id: 'F-002', auditId: 'A-003', title: 'Unreconciled Intercompany Balances', severity: 'Critical', status: 'Management Response', owner: 'Peter Ochieng', dueDate: '2026-07-15', description: 'KES 45M in intercompany transactions remain unreconciled beyond 90 days.' },
  { id: 'F-003', auditId: 'A-005', title: 'Incomplete KYC Documentation', severity: 'High', status: 'In Remediation', owner: 'John Odhiambo', dueDate: '2026-07-31', description: '12% of high-risk customer files are missing enhanced due diligence documentation.' },
  { id: 'F-004', auditId: 'A-007', title: 'Expired SSL Certificates on Production', severity: 'Critical', status: 'Open', owner: 'Mary Akinyi', dueDate: '2026-06-15', description: '3 production servers have SSL certificates expiring within 30 days.' },
  { id: 'F-005', auditId: 'A-001', title: 'Manual Journal Entry Controls', severity: 'Medium', status: 'Draft', owner: 'Grace Wanjiku', dueDate: '2026-08-15', description: 'Manual journal entries above KES 500K lack documented supervisor review.' },
  { id: 'F-006', auditId: 'A-004', title: 'Vendor Duplicate Payments', severity: 'Low', status: 'Closed', owner: 'David Mwangi', dueDate: '2026-03-31', description: 'Duplicate payment detection controls were implemented and tested effective.' },
]

export const useFindingStore = create<FindingState>((set, get) => ({
  findings: [],
  isLoading: false,

  fetchFindings: async () => {
    set({ isLoading: true })
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data, error } = await supabase
        .from('findings')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedData = (data || []).map(d => ({
        id: d.id,
        auditId: d.audit_id,
        title: d.title,
        severity: d.severity || "Medium",
        status: d.status || "Draft",
        owner: d.owner || "",
        dueDate: d.due_date || "",
        description: d.description || "",
        organization_id: d.organization_id
      }))
      if (typeof window !== "undefined") {
        localStorage.setItem('findings_cache', JSON.stringify(formattedData))
      }
      set({ findings: formattedData as Finding[], isLoading: false })
    } catch (err) {
      console.warn("Supabase query failed, trying to read findings from cache:", err)
      let cached = null
      if (typeof window !== "undefined") {
        cached = localStorage.getItem('findings_cache')
      }
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          set({ findings: parsed, isLoading: false })
          return
        } catch (parseErr) {
          console.error("Error parsing findings cache", parseErr)
        }
      }
      // Fall back to seed data
      console.warn("Using seed finding data (no auth session or query failed and no cache)")
      set({ findings: seedFindings, isLoading: false })
    }
  },

  addFinding: async (finding) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userData.user.id)
        .single()

      const newFinding: Record<string, string | number | boolean | null> = {
        audit_id: finding.auditId,
        title: finding.title,
        severity: finding.severity,
        status: finding.status,
        owner: finding.owner,
        due_date: finding.dueDate,
        description: finding.description || null,
        owner_id: userData.user.id,
        organization_id: profile?.organization_id || null
      }

      const { data, error } = await supabase
        .from('findings')
        .insert([newFinding])
        .select()
        .single()

      if (error) throw error

      const formattedData = {
        id: data.id,
        auditId: data.audit_id,
        title: data.title,
        severity: data.severity,
        status: data.status,
        owner: data.owner,
        dueDate: data.due_date,
        description: data.description,
        organization_id: data.organization_id
      } as Finding

      set((state) => {
        const newFindings = [formattedData, ...state.findings]
        if (typeof window !== "undefined") {
          localStorage.setItem('findings_cache', JSON.stringify(newFindings))
        }
        return { findings: newFindings }
      })
      toast.success("Finding created successfully")
    } catch {
      // Operate on local state only
      const localFinding: Finding = {
        id: `local-${crypto.randomUUID()}`,
        ...finding,
      }
      set((state) => {
        const newFindings = [localFinding, ...state.findings]
        if (typeof window !== "undefined") {
          localStorage.setItem('findings_cache', JSON.stringify(newFindings))
        }
        return { findings: newFindings }
      })
      toast.success("Finding created (offline mode)")
    }
  },

  updateFinding: async (id, updatedFinding) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const dbUpdate: Record<string, string | number | boolean | null> = {}
      if (updatedFinding.title !== undefined) dbUpdate.title = updatedFinding.title
      if (updatedFinding.severity !== undefined) dbUpdate.severity = updatedFinding.severity
      if (updatedFinding.status !== undefined) dbUpdate.status = updatedFinding.status
      if (updatedFinding.owner !== undefined) dbUpdate.owner = updatedFinding.owner
      if (updatedFinding.dueDate !== undefined) dbUpdate.due_date = updatedFinding.dueDate
      if (updatedFinding.description !== undefined) dbUpdate.description = updatedFinding.description

      const { error } = await supabase
        .from('findings')
        .update(dbUpdate)
        .eq('id', id)

      if (error) throw error

      set((state) => {
        const newFindings = state.findings.map((f) =>
          f.id === id ? { ...f, ...updatedFinding } : f
        )
        if (typeof window !== "undefined") {
          localStorage.setItem('findings_cache', JSON.stringify(newFindings))
        }
        return { findings: newFindings }
      })
      toast.success("Finding updated")
    } catch {
      // Operate on local state only
      set((state) => {
        const newFindings = state.findings.map((f) =>
          f.id === id ? { ...f, ...updatedFinding } : f
        )
        if (typeof window !== "undefined") {
          localStorage.setItem('findings_cache', JSON.stringify(newFindings))
        }
        return { findings: newFindings }
      })
      toast.success("Finding updated (offline mode)")
    }
  },

  deleteFinding: async (id) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { error } = await supabase
        .from('findings')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      set((state) => {
        const newFindings = state.findings.filter((f) => f.id !== id)
        if (typeof window !== "undefined") {
          localStorage.setItem('findings_cache', JSON.stringify(newFindings))
        }
        return { findings: newFindings }
      })
      toast.success("Finding archived")
    } catch {
      // Operate on local state only
      set((state) => {
        const newFindings = state.findings.filter((f) => f.id !== id)
        if (typeof window !== "undefined") {
          localStorage.setItem('findings_cache', JSON.stringify(newFindings))
        }
        return { findings: newFindings }
      })
      toast.success("Finding archived (offline mode)")
    }
  },
}))
