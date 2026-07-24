import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export interface Workpaper {
  id: string
  auditId: string
  title: string
  content: string
  status: "Draft" | "In Review" | "Reviewed" | "Signed Off"
  preparerId?: string
  reviewerId?: string
  createdAt?: string
  organization_id?: string
}

interface WorkpaperState {
  workpapers: Workpaper[]
  isLoading: boolean
  fetchWorkpapers: () => Promise<void>
  addWorkpaper: (workpaper: Omit<Workpaper, "id">) => Promise<string | undefined>
  updateWorkpaper: (id: string, workpaper: Partial<Workpaper>) => Promise<void>
  deleteWorkpaper: (id: string) => Promise<void>
}

const supabase = createClient()

export const useWorkpaperStore = create<WorkpaperState>((set) => ({
  workpapers: [],
  isLoading: false,

  fetchWorkpapers: async () => {
    set({ isLoading: true })
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data, error } = await supabase
        .from('workpapers')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedData = (data || []).map(d => ({
        id: d.id,
        auditId: d.audit_id,
        title: d.title,
        content: d.content || "",
        status: d.status || "Draft",
        preparerId: d.preparer_id,
        reviewerId: d.reviewer_id,
        createdAt: d.created_at,
        organization_id: d.organization_id
      }))
      if (typeof window !== "undefined") {
        localStorage.setItem('workpapers_cache', JSON.stringify(formattedData))
      }
      set({ workpapers: formattedData as Workpaper[], isLoading: false })
    } catch (error) {
      console.warn("Supabase query failed, trying to read workpapers from cache:", error)
      let cached = null
      if (typeof window !== "undefined") {
        cached = localStorage.getItem('workpapers_cache')
      }
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          set({ workpapers: parsed, isLoading: false })
          return
        } catch (parseErr) {
          console.error("Error parsing workpapers cache", parseErr)
        }
      }
      set({ workpapers: [], isLoading: false })
    }
  },

  addWorkpaper: async (workpaper) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userData.user.id)
        .single()

      const newWp: Record<string, string | number | boolean | null> = {
        audit_id: workpaper.auditId,
        title: workpaper.title,
        content: workpaper.content,
        status: workpaper.status,
        preparer_id: userData.user.id,
        organization_id: profile?.organization_id || null
      }

      const { data, error } = await supabase
        .from('workpapers')
        .insert([newWp])
        .select()
        .single()

      if (error) throw error

      const formattedData = {
        id: data.id,
        auditId: data.audit_id,
        title: data.title,
        content: data.content,
        status: data.status,
        preparerId: data.preparer_id,
        reviewerId: data.reviewer_id,
        createdAt: data.created_at,
        organization_id: data.organization_id
      } as Workpaper

      set((state) => {
        const newWps = [formattedData, ...state.workpapers]
        if (typeof window !== "undefined") {
          localStorage.setItem('workpapers_cache', JSON.stringify(newWps))
        }
        return { workpapers: newWps }
      })
      toast.success("Workpaper created")
      return data.id
    } catch (error) {
      const localId = `local-${crypto.randomUUID()}`
      const localWp: Workpaper = {
        id: localId,
        ...workpaper,
      }
      set((state) => {
        const newWps = [localWp, ...state.workpapers]
        if (typeof window !== "undefined") {
          localStorage.setItem('workpapers_cache', JSON.stringify(newWps))
        }
        return { workpapers: newWps }
      })
      toast.success("Workpaper created (offline mode)")
      return localId
    }
  },

  updateWorkpaper: async (id, updatedWp) => {
    try {
      const dbUpdate: Record<string, string | number | boolean | null> = {}
      if (updatedWp.auditId !== undefined) dbUpdate.audit_id = updatedWp.auditId
      if (updatedWp.title !== undefined) dbUpdate.title = updatedWp.title
      if (updatedWp.content !== undefined) dbUpdate.content = updatedWp.content
      if (updatedWp.status !== undefined) dbUpdate.status = updatedWp.status
      if (updatedWp.reviewerId !== undefined) dbUpdate.reviewer_id = updatedWp.reviewerId

      const { error } = await supabase
        .from('workpapers')
        .update(dbUpdate)
        .eq('id', id)

      if (error) throw error

      set((state) => {
        const newWps = state.workpapers.map((wp) =>
          wp.id === id ? { ...wp, ...updatedWp } : wp
        )
        if (typeof window !== "undefined") {
          localStorage.setItem('workpapers_cache', JSON.stringify(newWps))
        }
        return { workpapers: newWps }
      })
      toast.success("Workpaper updated")
    } catch (error) {
      set((state) => {
        const newWps = state.workpapers.map((wp) =>
          wp.id === id ? { ...wp, ...updatedWp } : wp
        )
        if (typeof window !== "undefined") {
          localStorage.setItem('workpapers_cache', JSON.stringify(newWps))
        }
        return { workpapers: newWps }
      })
      toast.success("Workpaper updated (offline mode)")
    }
  },

  deleteWorkpaper: async (id) => {
    try {
      const { error } = await supabase
        .from('workpapers')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      set((state) => {
        const newWps = state.workpapers.filter((wp) => wp.id !== id)
        if (typeof window !== "undefined") {
          localStorage.setItem('workpapers_cache', JSON.stringify(newWps))
        }
        return { workpapers: newWps }
      })
      toast.success("Workpaper archived")
    } catch (error) {
      set((state) => {
        const newWps = state.workpapers.filter((wp) => wp.id !== id)
        if (typeof window !== "undefined") {
          localStorage.setItem('workpapers_cache', JSON.stringify(newWps))
        }
        return { workpapers: newWps }
      })
      toast.success("Workpaper archived (offline mode)")
    }
  },
}))
