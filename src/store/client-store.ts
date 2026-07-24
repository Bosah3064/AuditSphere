import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface Client {
  id: string
  name: string
  industry: string
  kraPin: string
  financialYearEnd: string
  status: "Active" | "Inactive"
  contactPerson: string
  contactEmail: string
  lastAuditDate: string
  organization_id?: string
}

interface ClientState {
  clients: Client[]
  isLoading: boolean
  fetchClients: () => Promise<void>
  addClient: (client: Omit<Client, "id">) => Promise<void>
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
}

const mockClients: Client[] = [
  { id: 'c1', name: 'Safaricom PLC', industry: 'Telecommunications', kraPin: 'P051098433Z', financialYearEnd: 'March 31', status: 'Active', contactPerson: 'Peter Ndegwa', contactEmail: 'finance@safaricom.co.ke', lastAuditDate: '2025-05-15' },
  { id: 'c2', name: 'Equity Group Holdings', industry: 'Banking', kraPin: 'P000000000A', financialYearEnd: 'December 31', status: 'Active', contactPerson: 'James Mwangi', contactEmail: 'audit@equitybank.co.ke', lastAuditDate: '2026-02-10' },
  { id: 'c3', name: 'Kenya Airways', industry: 'Aviation', kraPin: 'P000123456B', financialYearEnd: 'December 31', status: 'Active', contactPerson: 'Allan Kilavuka', contactEmail: 'cfo@kenya-airways.com', lastAuditDate: '2025-11-20' },
  { id: 'c4', name: 'KCB Group PLC', industry: 'Banking', kraPin: 'P000654321C', financialYearEnd: 'December 31', status: 'Active', contactPerson: 'Paul Russo', contactEmail: 'finance@kcbgroup.com', lastAuditDate: '2026-01-15' },
  { id: 'c5', name: 'East African Breweries Ltd', industry: 'Manufacturing', kraPin: 'P000789012D', financialYearEnd: 'June 30', status: 'Inactive', contactPerson: 'Jane Karuku', contactEmail: 'audit@eabl.com', lastAuditDate: '2025-08-22' }
]

const supabase = createClient()

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  isLoading: false,

  fetchClients: async () => {
    set({ isLoading: true })
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedData = (data || []).map(d => ({
        id: d.id,
        name: d.name,
        industry: d.industry || "",
        kraPin: d.kra_pin || "",
        financialYearEnd: d.financial_year_end || "",
        status: d.status || "Active",
        contactPerson: d.contact_person || "",
        contactEmail: d.contact_email || "",
        lastAuditDate: d.last_audit_date || "",
        organization_id: d.organization_id
      }))
      if (typeof window !== "undefined") {
        localStorage.setItem('clients_cache', JSON.stringify(formattedData))
      }
      set({ clients: formattedData as Client[], isLoading: false })
    } catch (err) {
      console.warn("Supabase query failed, trying to read clients from cache:", err)
      let cached = null
      if (typeof window !== "undefined") {
        cached = localStorage.getItem('clients_cache')
      }
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          set({ clients: parsed, isLoading: false })
          return
        } catch (parseErr) {
          console.error("Error parsing clients cache", parseErr)
        }
      }
      // Fall back to seed data
      console.warn("Using seed client data (no auth session or query failed and no cache)")
      set({ clients: mockClients, isLoading: false })
    }
  },

  addClient: async (client) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userData.user.id)
        .single()

      const newClient: Record<string, string | number | boolean | null> = {
        name: client.name,
        industry: client.industry,
        kra_pin: client.kraPin,
        financial_year_end: client.financialYearEnd,
        status: client.status,
        contact_person: client.contactPerson,
        contact_email: client.contactEmail,
        last_audit_date: client.lastAuditDate,
        organization_id: profile?.organization_id || null
      }

      const { data, error } = await supabase
        .from('clients')
        .insert([newClient])
        .select()
        .single()

      if (error) throw error

      const formattedData = {
        id: data.id,
        name: data.name,
        industry: data.industry,
        kraPin: data.kra_pin,
        financialYearEnd: data.financial_year_end,
        status: data.status,
        contactPerson: data.contact_person,
        contactEmail: data.contact_email,
        lastAuditDate: data.last_audit_date,
        organization_id: data.organization_id
      } as Client

      set((state) => {
        const newClients = [formattedData, ...state.clients]
        if (typeof window !== "undefined") {
          localStorage.setItem('clients_cache', JSON.stringify(newClients))
        }
        return { clients: newClients }
      })
      toast.success("Client added successfully")
    } catch {
      const newClient = { ...client, id: `c${Date.now()}` }
      set((state) => {
        const newClients = [newClient, ...state.clients]
        if (typeof window !== "undefined") {
          localStorage.setItem('clients_cache', JSON.stringify(newClients))
        }
        return { clients: newClients }
      })
      toast.success("Client added (Local)")
    }
  },

  updateClient: async (id, updates) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const dbUpdate: Record<string, string | number | boolean | null> = {}
      if (updates.name !== undefined) dbUpdate.name = updates.name
      if (updates.industry !== undefined) dbUpdate.industry = updates.industry
      if (updates.kraPin !== undefined) dbUpdate.kra_pin = updates.kraPin
      if (updates.financialYearEnd !== undefined) dbUpdate.financial_year_end = updates.financialYearEnd
      if (updates.status !== undefined) dbUpdate.status = updates.status
      if (updates.contactPerson !== undefined) dbUpdate.contact_person = updates.contactPerson
      if (updates.contactEmail !== undefined) dbUpdate.contact_email = updates.contactEmail
      if (updates.lastAuditDate !== undefined) dbUpdate.last_audit_date = updates.lastAuditDate

      const { error } = await supabase
        .from('clients')
        .update(dbUpdate)
        .eq('id', id)

      if (error) throw error

      set((state) => {
        const newClients = state.clients.map(c => c.id === id ? { ...c, ...updates } : c)
        if (typeof window !== "undefined") {
          localStorage.setItem('clients_cache', JSON.stringify(newClients))
        }
        return { clients: newClients }
      })
      toast.success("Client updated")
    } catch {
      set((state) => {
        const newClients = state.clients.map(c => c.id === id ? { ...c, ...updates } : c)
        if (typeof window !== "undefined") {
          localStorage.setItem('clients_cache', JSON.stringify(newClients))
        }
        return { clients: newClients }
      })
      toast.success("Client updated (Local)")
    }
  },

  deleteClient: async (id) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { error } = await supabase
        .from('clients')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      set((state) => {
        const newClients = state.clients.filter(c => c.id !== id)
        if (typeof window !== "undefined") {
          localStorage.setItem('clients_cache', JSON.stringify(newClients))
        }
        return { clients: newClients }
      })
      toast.success("Client archived")
    } catch {
      set((state) => {
        const newClients = state.clients.filter(c => c.id !== id)
        if (typeof window !== "undefined") {
          localStorage.setItem('clients_cache', JSON.stringify(newClients))
        }
        return { clients: newClients }
      })
      toast.success("Client archived (Local)")
    }
  }
}))
