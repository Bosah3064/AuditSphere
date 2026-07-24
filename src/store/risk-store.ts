import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export interface Risk {
  id: string
  title: string
  category: string
  impact: number
  likelihood: number
  owner: string
  status: "Open" | "Mitigated" | "Accepted" | "Closed"
  createdAt?: string
  organization_id?: string
}

interface RiskState {
  risks: Risk[]
  isLoading: boolean
  fetchRisks: () => Promise<void>
  addRisk: (risk: Omit<Risk, "id">) => Promise<void>
  updateRisk: (id: string, risk: Partial<Risk>) => Promise<void>
  deleteRisk: (id: string) => Promise<void>
}

const supabase = createClient()

const seedRisks: Risk[] = [
  { id: 'R-001', title: 'Revenue Misstatement Risk', category: 'Financial', impact: 5, likelihood: 3, owner: 'Peter Ochieng', status: 'Open' },
  { id: 'R-002', title: 'Ransomware Attack Exposure', category: 'IT', impact: 5, likelihood: 4, owner: 'Mary Akinyi', status: 'Open' },
  { id: 'R-003', title: 'Regulatory Non-Compliance (CBK)', category: 'Compliance', impact: 4, likelihood: 3, owner: 'John Odhiambo', status: 'Mitigated' },
  { id: 'R-004', title: 'Procurement Fraud', category: 'Operational', impact: 4, likelihood: 2, owner: 'Grace Wanjiku', status: 'Accepted' },
  { id: 'R-005', title: 'Foreign Exchange Exposure', category: 'Financial', impact: 3, likelihood: 4, owner: 'Sarah Kimani', status: 'Open' },
  { id: 'R-006', title: 'Data Privacy Breach (DPA 2019)', category: 'Compliance', impact: 5, likelihood: 2, owner: 'David Mwangi', status: 'Open' },
  { id: 'R-007', title: 'Key Person Dependency', category: 'Strategic', impact: 3, likelihood: 3, owner: 'James Kamau', status: 'Open' },
  { id: 'R-008', title: 'Supplier Concentration Risk', category: 'Operational', impact: 3, likelihood: 2, owner: 'Alice Njeri', status: 'Mitigated' },
]

export const useRiskStore = create<RiskState>((set, get) => ({
  risks: [],
  isLoading: false,

  fetchRisks: async () => {
    set({ isLoading: true })
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data, error } = await supabase
        .from('risks')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedData = (data || []).map(d => ({
        id: d.id,
        title: d.title,
        category: d.category || "Operational",
        impact: d.impact || 1,
        likelihood: d.likelihood || 1,
        owner: d.owner || "",
        status: d.status || "Open",
        createdAt: d.created_at,
        organization_id: d.organization_id
      }))
      if (typeof window !== "undefined") {
        localStorage.setItem('risks_cache', JSON.stringify(formattedData))
      }
      set({ risks: formattedData as Risk[], isLoading: false })
    } catch (err) {
      console.warn("Supabase query failed, trying to read risks from cache:", err)
      let cached = null
      if (typeof window !== "undefined") {
        cached = localStorage.getItem('risks_cache')
      }
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          set({ risks: parsed, isLoading: false })
          return
        } catch (parseErr) {
          console.error("Error parsing risks cache", parseErr)
        }
      }
      // Fall back to seed data
      console.warn("Using seed risk data (no auth session or query failed and no cache)")
      set({ risks: seedRisks, isLoading: false })
    }
  },

  addRisk: async (risk) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userData.user.id)
        .single()

      const newRisk: Record<string, string | number | boolean | null> = {
        title: risk.title,
        category: risk.category,
        impact: risk.impact,
        likelihood: risk.likelihood,
        owner: risk.owner,
        status: risk.status,
        owner_id: userData.user.id,
        organization_id: profile?.organization_id || null
      }

      const { data, error } = await supabase
        .from('risks')
        .insert([newRisk])
        .select()
        .single()

      if (error) throw error

      const formattedData = {
        id: data.id,
        title: data.title,
        category: data.category || "Operational",
        impact: data.impact || 1,
        likelihood: data.likelihood || 1,
        owner: data.owner || "",
        status: data.status || "Open",
        createdAt: data.created_at,
        organization_id: data.organization_id
      } as Risk

      set((state) => {
        const newRisks = [formattedData, ...state.risks]
        if (typeof window !== "undefined") {
          localStorage.setItem('risks_cache', JSON.stringify(newRisks))
        }
        return { risks: newRisks }
      })
      toast.success("Risk created successfully")
    } catch {
      // Operate on local state only
      const localRisk: Risk = {
        id: `local-${crypto.randomUUID()}`,
        ...risk,
      }
      set((state) => {
        const newRisks = [localRisk, ...state.risks]
        if (typeof window !== "undefined") {
          localStorage.setItem('risks_cache', JSON.stringify(newRisks))
        }
        return { risks: newRisks }
      })
      toast.success("Risk created (offline mode)")
    }
  },

  updateRisk: async (id, updatedRisk) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const dbUpdate: Record<string, string | number | boolean | null> = {}
      if (updatedRisk.title !== undefined) dbUpdate.title = updatedRisk.title
      if (updatedRisk.category !== undefined) dbUpdate.category = updatedRisk.category
      if (updatedRisk.impact !== undefined) dbUpdate.impact = updatedRisk.impact
      if (updatedRisk.likelihood !== undefined) dbUpdate.likelihood = updatedRisk.likelihood
      if (updatedRisk.owner !== undefined) dbUpdate.owner = updatedRisk.owner
      if (updatedRisk.status !== undefined) dbUpdate.status = updatedRisk.status

      const { error } = await supabase
        .from('risks')
        .update(dbUpdate)
        .eq('id', id)

      if (error) throw error

      set((state) => {
        const newRisks = state.risks.map((risk) =>
          risk.id === id ? { ...risk, ...updatedRisk } : risk
        )
        if (typeof window !== "undefined") {
          localStorage.setItem('risks_cache', JSON.stringify(newRisks))
        }
        return { risks: newRisks }
      })
      toast.success("Risk updated")
    } catch {
      // Operate on local state only
      set((state) => {
        const newRisks = state.risks.map((risk) =>
          risk.id === id ? { ...risk, ...updatedRisk } : risk
        )
        if (typeof window !== "undefined") {
          localStorage.setItem('risks_cache', JSON.stringify(newRisks))
        }
        return { risks: newRisks }
      })
      toast.success("Risk updated (offline mode)")
    }
  },

  deleteRisk: async (id) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { error } = await supabase
        .from('risks')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      set((state) => {
        const newRisks = state.risks.filter((risk) => risk.id !== id)
        if (typeof window !== "undefined") {
          localStorage.setItem('risks_cache', JSON.stringify(newRisks))
        }
        return { risks: newRisks }
      })
      toast.success("Risk archived")
    } catch {
      // Operate on local state only
      set((state) => {
        const newRisks = state.risks.filter((risk) => risk.id !== id)
        if (typeof window !== "undefined") {
          localStorage.setItem('risks_cache', JSON.stringify(newRisks))
        }
        return { risks: newRisks }
      })
      toast.success("Risk archived (offline mode)")
    }
  },
}))
