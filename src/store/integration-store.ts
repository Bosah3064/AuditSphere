import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"

export interface Integration {
  id: string
  name: string
  provider: string
  category: "Financial" | "IT Security" | "HR" | "Operations"
  status: "Connected" | "Disconnected" | "Error"
  lastSync?: string
  organization_id?: string
}

interface IntegrationState {
  integrations: Integration[]
  isLoading: boolean
  fetchIntegrations: () => Promise<void>
  connectIntegration: (integration: Omit<Integration, "id" | "status" | "lastSync">) => Promise<void>
  disconnectIntegration: (id: string) => Promise<void>
  runScan: (id: string) => Promise<void> // Simulator
}

const supabase = createClient()

export const useIntegrationStore = create<IntegrationState>((set, get) => ({
  integrations: [],
  isLoading: false,
  fetchIntegrations: async () => {
    set({ isLoading: true })
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        set({ integrations: [], isLoading: false })
        return
      }

      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedData = (data || []).map(d => ({
        id: d.id,
        name: d.name,
        provider: d.provider,
        category: d.category as any,
        status: d.status as any,
        lastSync: d.last_sync,
        organization_id: d.organization_id
      }))
      localStorage.setItem('integrations_cache', JSON.stringify(formattedData))
      set({ integrations: formattedData as Integration[], isLoading: false })
    } catch {
      // Try localStorage cache
      try {
        const cached = localStorage.getItem('integrations_cache')
        if (cached) {
          set({ integrations: JSON.parse(cached), isLoading: false })
          return
        }
      } catch { /* ignore */ }
      set({ isLoading: false })
    }
  },
  connectIntegration: async (integration) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data: profile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', userData.user.id)
      .single()

    // Check if it already exists to avoid duplicates in our simple UI
    const existing = get().integrations.find(i => i.provider === integration.provider)
    if (existing) {
      // Just update status
      await supabase.from('integrations').update({ status: 'Connected', last_sync: new Date().toISOString() }).eq('id', existing.id)
      set(state => ({
        integrations: state.integrations.map(i => i.id === existing.id ? { ...i, status: "Connected", lastSync: new Date().toISOString() } : i)
      }))
      return
    }

    const newInt = {
      name: integration.name,
      provider: integration.provider,
      category: integration.category,
      status: "Connected",
      last_sync: new Date().toISOString(),
      organization_id: profile?.organization_id
    }

    const { data, error } = await supabase
      .from('integrations')
      .insert([newInt])
      .select()
      .single()

    if (!error && data) {
      const formattedData = {
        id: data.id,
        name: data.name,
        provider: data.provider,
        category: data.category,
        status: data.status,
        lastSync: data.last_sync,
        organization_id: data.organization_id
      } as Integration
      
      set((state) => ({
        integrations: [...state.integrations, formattedData],
      }))
    }
  },
  disconnectIntegration: async (id) => {
    const { error } = await supabase
      .from('integrations')
      .update({ status: 'Disconnected' })
      .eq('id', id)

    if (!error) {
      set((state) => ({
        integrations: state.integrations.map((int) =>
          int.id === id ? { ...int, status: "Disconnected" } : int
        ),
      }))
    }
  },
  runScan: async (id) => {
    // This is the simulation function
    const integration = get().integrations.find(i => i.id === id)
    if (!integration) return

    // 1. Update lastSync time
    const now = new Date().toISOString()
    await supabase.from('integrations').update({ last_sync: now }).eq('id', id)
    
    set((state) => ({
      integrations: state.integrations.map((int) =>
        int.id === id ? { ...int, lastSync: now } : int
      ),
    }))

    // 2. Generate Mock Findings in Supabase based on Category
    const { data: userData } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('users').select('organization_id').eq('id', userData?.user?.id).single()

    let mockFindings: any[] = []

    if (integration.category === "Financial") {
      mockFindings = [
        {
          title: `[${integration.name}] Unapproved manual journal entry over $10,000`,
          severity: 'High',
          status: 'Open',
          owner: 'Finance Controller',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          organization_id: profile?.organization_id
        },
        {
          title: `[${integration.name}] Duplicate vendor payment detected`,
          severity: 'Critical',
          status: 'Open',
          owner: 'AP Manager',
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          organization_id: profile?.organization_id
        }
      ]
    } else if (integration.category === "IT Security") {
      mockFindings = [
        {
          title: `[${integration.name}] S3 Bucket publicly accessible`,
          severity: 'Critical',
          status: 'Open',
          owner: 'DevOps',
          due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          organization_id: profile?.organization_id
        },
        {
          title: `[${integration.name}] MFA not enforced for root account`,
          severity: 'High',
          status: 'Open',
          owner: 'IT Security',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          organization_id: profile?.organization_id
        }
      ]
    }

    // We need an Audit ID to attach findings to. If no audit exists, we can't insert findings easily.
    // For the simulation, we'll fetch the first audit in the org.
    const { data: audits } = await supabase.from('audits').select('id').limit(1)
    
    if (audits && audits.length > 0 && mockFindings.length > 0) {
      const auditId = audits[0].id
      const findingsToInsert = mockFindings.map(f => ({ ...f, audit_id: auditId, owner_id: userData?.user?.id }))
      await supabase.from('findings').insert(findingsToInsert)
    }
  }
}))
