import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export interface Audit {
  id: string
  title: string
  type: string
  status: "Planning" | "Fieldwork" | "Review" | "Reporting" | "Completed"
  progress: number
  risk: "Critical" | "High" | "Medium" | "Low"
  startDate: string
  endDate: string
  lead: string
  team: string[]
  organization_id?: string
}

interface AuditState {
  audits: Audit[]
  isLoading: boolean
  fetchAudits: () => Promise<void>
  addAudit: (audit: Omit<Audit, "id">) => Promise<void>
  updateAudit: (id: string, audit: Partial<Audit>) => Promise<void>
  deleteAudit: (id: string) => Promise<void>
}

const supabase = createClient()

const seedAudits: Audit[] = [
  { id: 'A-001', title: 'Q3 2026 Financial Controls', type: 'Financial', status: 'Fieldwork', progress: 65, risk: 'High', startDate: '2026-06-01', endDate: '2026-08-15', lead: 'Sarah Kimani', team: ['John Odhiambo', 'Grace Wanjiku'] },
  { id: 'A-002', title: 'IT General Controls Review', type: 'IT', status: 'Planning', progress: 20, risk: 'Medium', startDate: '2026-07-01', endDate: '2026-09-30', lead: 'David Mwangi', team: ['Alice Njeri'] },
  { id: 'A-003', title: 'Revenue Recognition Audit', type: 'Financial', status: 'Review', progress: 85, risk: 'Critical', startDate: '2026-04-01', endDate: '2026-06-30', lead: 'Peter Ochieng', team: ['Mary Akinyi', 'James Kamau'] },
  { id: 'A-004', title: 'Procurement Process Audit', type: 'Operational', status: 'Completed', progress: 100, risk: 'Low', startDate: '2026-01-15', endDate: '2026-03-31', lead: 'Grace Wanjiku', team: ['David Mwangi'] },
  { id: 'A-005', title: 'Anti-Money Laundering Compliance', type: 'Compliance', status: 'Fieldwork', progress: 45, risk: 'High', startDate: '2026-05-01', endDate: '2026-07-31', lead: 'John Odhiambo', team: ['Sarah Kimani', 'Peter Ochieng'] },
  { id: 'A-006', title: 'IFRS 16 Lease Accounting', type: 'Financial', status: 'Planning', progress: 10, risk: 'Medium', startDate: '2026-07-15', endDate: '2026-10-15', lead: 'Alice Njeri', team: ['James Kamau'] },
  { id: 'A-007', title: 'Cybersecurity Assessment', type: 'IT', status: 'Reporting', progress: 90, risk: 'Critical', startDate: '2026-03-01', endDate: '2026-05-31', lead: 'Mary Akinyi', team: ['David Mwangi', 'John Odhiambo'] },
  { id: 'A-008', title: 'Payroll Controls Review', type: 'Operational', status: 'Fieldwork', progress: 55, risk: 'Medium', startDate: '2026-06-15', endDate: '2026-08-31', lead: 'James Kamau', team: ['Grace Wanjiku'] },
]

export const useAuditStore = create<AuditState>((set, get) => ({
  audits: [],
  isLoading: false,

  fetchAudits: async () => {
    set({ isLoading: true })
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedData = (data || []).map(d => ({
        id: d.id,
        title: d.title,
        type: d.type || "Operational",
        status: d.status || "Planning",
        progress: d.progress || 0,
        risk: d.risk || "Medium",
        startDate: d.start_date || "",
        endDate: d.end_date || "",
        lead: d.lead || "",
        team: d.team || [],
        organization_id: d.organization_id
      }))
      if (typeof window !== "undefined") {
        localStorage.setItem('audits_cache', JSON.stringify(formattedData))
      }
      set({ audits: formattedData as Audit[], isLoading: false })
    } catch (err) {
      console.warn("Supabase query failed, trying to read audits from cache:", err)
      let cached = null
      if (typeof window !== "undefined") {
        cached = localStorage.getItem('audits_cache')
      }
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          set({ audits: parsed, isLoading: false })
          return
        } catch (parseErr) {
          console.error("Error parsing audits cache", parseErr)
        }
      }
      // Fall back to seed data
      console.warn("Using seed audit data (no auth session or query failed and no cache)")
      set({ audits: seedAudits, isLoading: false })
    }
  },

  addAudit: async (audit) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userData.user.id)
        .single()

      const newAudit: Record<string, string | number | boolean | string[] | null> = {
        title: audit.title,
        type: audit.type,
        status: audit.status,
        progress: audit.progress,
        risk: audit.risk,
        start_date: audit.startDate,
        end_date: audit.endDate,
        lead: audit.lead,
        team: audit.team,
        created_by: userData.user.id,
        organization_id: profile?.organization_id || null
      }

      const { data, error } = await supabase
        .from('audits')
        .insert([newAudit])
        .select()
        .single()

      if (error) throw error

      const formattedData = {
        id: data.id,
        title: data.title,
        type: data.type || "Operational",
        status: data.status || "Planning",
        progress: data.progress || 0,
        risk: data.risk || "Medium",
        startDate: data.start_date || "",
        endDate: data.end_date || "",
        lead: data.lead || "",
        team: data.team || [],
        organization_id: data.organization_id
      } as Audit

      set((state) => {
        const newAudits = [formattedData, ...state.audits]
        if (typeof window !== "undefined") {
          localStorage.setItem('audits_cache', JSON.stringify(newAudits))
        }
        return { audits: newAudits }
      })
      toast.success("Audit created successfully")
    } catch {
      // Operate on local state only
      const localAudit: Audit = {
        id: `local-${crypto.randomUUID()}`,
        ...audit,
      }
      set((state) => {
        const newAudits = [localAudit, ...state.audits]
        if (typeof window !== "undefined") {
          localStorage.setItem('audits_cache', JSON.stringify(newAudits))
        }
        return { audits: newAudits }
      })
      toast.success("Audit created (offline mode)")
    }
  },

  updateAudit: async (id, updatedAudit) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const dbUpdate: Record<string, string | number | boolean | string[] | null> = {}
      if (updatedAudit.title !== undefined) dbUpdate.title = updatedAudit.title
      if (updatedAudit.type !== undefined) dbUpdate.type = updatedAudit.type
      if (updatedAudit.status !== undefined) dbUpdate.status = updatedAudit.status
      if (updatedAudit.progress !== undefined) dbUpdate.progress = updatedAudit.progress
      if (updatedAudit.risk !== undefined) dbUpdate.risk = updatedAudit.risk
      if (updatedAudit.startDate !== undefined) dbUpdate.start_date = updatedAudit.startDate
      if (updatedAudit.endDate !== undefined) dbUpdate.end_date = updatedAudit.endDate
      if (updatedAudit.lead !== undefined) dbUpdate.lead = updatedAudit.lead
      if (updatedAudit.team !== undefined) dbUpdate.team = updatedAudit.team

      const { error } = await supabase
        .from('audits')
        .update(dbUpdate)
        .eq('id', id)

      if (error) throw error

      set((state) => {
        const newAudits = state.audits.map((audit) =>
          audit.id === id ? { ...audit, ...updatedAudit } : audit
        )
        if (typeof window !== "undefined") {
          localStorage.setItem('audits_cache', JSON.stringify(newAudits))
        }
        return { audits: newAudits }
      })
      toast.success("Audit updated")
    } catch {
      // Operate on local state only
      set((state) => {
        const newAudits = state.audits.map((audit) =>
          audit.id === id ? { ...audit, ...updatedAudit } : audit
        )
        if (typeof window !== "undefined") {
          localStorage.setItem('audits_cache', JSON.stringify(newAudits))
        }
        return { audits: newAudits }
      })
      toast.success("Audit updated (offline mode)")
    }
  },

  deleteAudit: async (id) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      // Soft delete
      const { error } = await supabase
        .from('audits')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      set((state) => {
        const newAudits = state.audits.filter((audit) => audit.id !== id)
        if (typeof window !== "undefined") {
          localStorage.setItem('audits_cache', JSON.stringify(newAudits))
        }
        return { audits: newAudits }
      })
      toast.success("Audit archived")
    } catch {
      // Operate on local state only
      set((state) => {
        const newAudits = state.audits.filter((audit) => audit.id !== id)
        if (typeof window !== "undefined") {
          localStorage.setItem('audits_cache', JSON.stringify(newAudits))
        }
        return { audits: newAudits }
      })
      toast.success("Audit archived (offline mode)")
    }
  },
}))
