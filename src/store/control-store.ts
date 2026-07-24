import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export interface Control {
  id: string
  riskId?: string
  title: string
  description?: string
  type: "Preventive" | "Detective" | "Corrective"
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annual" | "As Needed"
  status: "Effective" | "Ineffective" | "Not Tested"
  owner: string
  organization_id?: string
}

interface ControlState {
  controls: Control[]
  isLoading: boolean
  fetchControls: () => Promise<void>
  addControl: (control: Omit<Control, "id">) => Promise<void>
  updateControl: (id: string, control: Partial<Control>) => Promise<void>
  deleteControl: (id: string) => Promise<void>
}

const supabase = createClient()

const seedControls: Control[] = [
  { id: 'C-001', riskId: 'R-001', title: 'Monthly Revenue Reconciliation', description: 'Finance team reconciles revenue sub-ledger to GL monthly.', type: 'Detective', frequency: 'Monthly', status: 'Effective', owner: 'Peter Ochieng' },
  { id: 'C-002', riskId: 'R-002', title: 'Endpoint Detection & Response', description: 'EDR solution deployed on all endpoints with 24/7 SOC monitoring.', type: 'Preventive', frequency: 'Daily', status: 'Effective', owner: 'Mary Akinyi' },
  { id: 'C-003', riskId: 'R-003', title: 'Regulatory Compliance Dashboard', description: 'Automated dashboard tracking CBK prudential requirements.', type: 'Detective', frequency: 'Weekly', status: 'Effective', owner: 'John Odhiambo' },
  { id: 'C-004', riskId: 'R-004', title: 'Three-Way PO Matching', description: 'System enforces 3-way match (PO, GRN, Invoice) before payment.', type: 'Preventive', frequency: 'As Needed', status: 'Effective', owner: 'Grace Wanjiku' },
  { id: 'C-005', riskId: 'R-005', title: 'FX Hedging Policy Review', description: 'Treasury reviews and updates FX hedging positions quarterly.', type: 'Preventive', frequency: 'Quarterly', status: 'Not Tested', owner: 'Sarah Kimani' },
  { id: 'C-006', riskId: 'R-006', title: 'Data Access Review', description: 'Quarterly access certification for systems containing PII.', type: 'Detective', frequency: 'Quarterly', status: 'Effective', owner: 'David Mwangi' },
]

export const useControlStore = create<ControlState>((set, get) => ({
  controls: [],
  isLoading: false,

  fetchControls: async () => {
    set({ isLoading: true })
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data, error } = await supabase
        .from('controls')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedData = (data || []).map(d => ({
        id: d.id,
        riskId: d.risk_id,
        title: d.title,
        description: d.description || "",
        type: d.type || "Preventive",
        frequency: d.frequency || "Monthly",
        status: d.status || "Not Tested",
        owner: d.owner || "",
        organization_id: d.organization_id
      }))
      if (typeof window !== "undefined") {
        localStorage.setItem('controls_cache', JSON.stringify(formattedData))
      }
      set({ controls: formattedData as Control[], isLoading: false })
    } catch (err) {
      console.warn("Supabase query failed, trying to read controls from cache:", err)
      let cached = null
      if (typeof window !== "undefined") {
        cached = localStorage.getItem('controls_cache')
      }
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          set({ controls: parsed, isLoading: false })
          return
        } catch (parseErr) {
          console.error("Error parsing controls cache", parseErr)
        }
      }
      // Fall back to seed data
      console.warn("Using seed control data (no auth session or query failed and no cache)")
      set({ controls: seedControls, isLoading: false })
    }
  },

  addControl: async (control) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userData.user.id)
        .single()

      const newControl: Record<string, string | number | boolean | null> = {
        title: control.title,
        description: control.description || null,
        type: control.type,
        frequency: control.frequency,
        status: control.status,
        owner: control.owner,
        risk_id: control.riskId || null,
        organization_id: profile?.organization_id || null
      }

      const { data, error } = await supabase
        .from('controls')
        .insert([newControl])
        .select()
        .single()

      if (error) throw error

      const formattedData = {
        id: data.id,
        riskId: data.risk_id,
        title: data.title,
        description: data.description,
        type: data.type,
        frequency: data.frequency,
        status: data.status,
        owner: data.owner,
        organization_id: data.organization_id
      } as Control

      set((state) => {
        const newControls = [formattedData, ...state.controls]
        if (typeof window !== "undefined") {
          localStorage.setItem('controls_cache', JSON.stringify(newControls))
        }
        return { controls: newControls }
      })
      toast.success("Control created successfully")
    } catch {
      // Operate on local state only
      const localControl: Control = {
        id: `local-${crypto.randomUUID()}`,
        ...control,
      }
      set((state) => {
        const newControls = [localControl, ...state.controls]
        if (typeof window !== "undefined") {
          localStorage.setItem('controls_cache', JSON.stringify(newControls))
        }
        return { controls: newControls }
      })
      toast.success("Control created (offline mode)")
    }
  },

  updateControl: async (id, updatedControl) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const dbUpdate: Record<string, string | number | boolean | null> = {}
      if (updatedControl.title !== undefined) dbUpdate.title = updatedControl.title
      if (updatedControl.description !== undefined) dbUpdate.description = updatedControl.description
      if (updatedControl.type !== undefined) dbUpdate.type = updatedControl.type
      if (updatedControl.frequency !== undefined) dbUpdate.frequency = updatedControl.frequency
      if (updatedControl.status !== undefined) dbUpdate.status = updatedControl.status
      if (updatedControl.owner !== undefined) dbUpdate.owner = updatedControl.owner

      const { error } = await supabase
        .from('controls')
        .update(dbUpdate)
        .eq('id', id)

      if (error) throw error

      set((state) => {
        const newControls = state.controls.map((c) =>
          c.id === id ? { ...c, ...updatedControl } : c
        )
        if (typeof window !== "undefined") {
          localStorage.setItem('controls_cache', JSON.stringify(newControls))
        }
        return { controls: newControls }
      })
      toast.success("Control updated")
    } catch {
      // Operate on local state only
      set((state) => {
        const newControls = state.controls.map((c) =>
          c.id === id ? { ...c, ...updatedControl } : c
        )
        if (typeof window !== "undefined") {
          localStorage.setItem('controls_cache', JSON.stringify(newControls))
        }
        return { controls: newControls }
      })
      toast.success("Control updated (offline mode)")
    }
  },

  deleteControl: async (id) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { error } = await supabase
        .from('controls')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      set((state) => {
        const newControls = state.controls.filter((c) => c.id !== id)
        if (typeof window !== "undefined") {
          localStorage.setItem('controls_cache', JSON.stringify(newControls))
        }
        return { controls: newControls }
      })
      toast.success("Control archived")
    } catch {
      // Operate on local state only
      set((state) => {
        const newControls = state.controls.filter((c) => c.id !== id)
        if (typeof window !== "undefined") {
          localStorage.setItem('controls_cache', JSON.stringify(newControls))
        }
        return { controls: newControls }
      })
      toast.success("Control archived (offline mode)")
    }
  },
}))
