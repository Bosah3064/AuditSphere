import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { 
  AuditProgram, 
  AuditProcedure, 
  AuditEvidence,
  ProgramStatus,
  ProcedureStatus
} from "@/types"

interface ProgramState {
  programs: AuditProgram[]
  procedures: AuditProcedure[]
  evidence: AuditEvidence[]
  isLoading: boolean
  
  // Programs
  fetchPrograms: (auditId: string) => Promise<void>
  addProgram: (program: Omit<AuditProgram, "id" | "createdAt" | "updatedAt">) => Promise<string | undefined>
  updateProgram: (id: string, program: Partial<AuditProgram>) => Promise<void>
  
  // Procedures
  fetchProcedures: (programId: string) => Promise<void>
  addProcedure: (procedure: Omit<AuditProcedure, "id" | "createdAt" | "updatedAt">) => Promise<string | undefined>
  updateProcedure: (id: string, procedure: Partial<AuditProcedure>) => Promise<void>
  
  // Evidence
  fetchEvidence: (procedureId: string) => Promise<void>
  linkEvidence: (evidence: Omit<AuditEvidence, "id" | "createdAt" | "updatedAt">) => Promise<void>
  unlinkEvidence: (id: string) => Promise<void>
}

const supabase = createClient()

export const useProgramStore = create<ProgramState>((set, get) => ({
  programs: [],
  procedures: [],
  evidence: [],
  isLoading: false,

  // ============================================================
  // PROGRAMS
  // ============================================================
  fetchPrograms: async (auditId: string) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('audit_programs')
        .select('*')
        .eq('audit_id', auditId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })

      if (error) throw error

      const formatted = (data || []).map(d => ({
        id: d.id,
        auditId: d.audit_id,
        title: d.title,
        description: d.description || "",
        status: d.status as ProgramStatus,
        organization_id: d.organization_id,
      }))
      
      set({ programs: formatted, isLoading: false })
      localStorage.setItem('programs_cache', JSON.stringify(formatted))
    } catch (error) {
      console.error("Failed to fetch programs:", error)
      // Try localStorage cache
      try {
        const cached = localStorage.getItem('programs_cache')
        if (cached) {
          set({ programs: JSON.parse(cached), isLoading: false })
          return
        }
      } catch { /* ignore */ }
      toast.error("Failed to load audit programs")
      set({ isLoading: false })
    }
  },

  addProgram: async (program) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return undefined

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userData.user.id)
        .single()

      const newProgram: Record<string, any> = {
        audit_id: program.auditId,
        title: program.title,
        description: program.description || null,
        status: program.status,
        organization_id: profile?.organization_id || null
      }

      const { data, error } = await supabase
        .from('audit_programs')
        .insert([newProgram])
        .select()
        .single()

      if (error) throw error

      const formatted = {
        id: data.id,
        auditId: data.audit_id,
        title: data.title,
        description: data.description || "",
        status: data.status as ProgramStatus,
        organization_id: data.organization_id,
      }

      set((state) => ({ programs: [...state.programs, formatted] }))
      toast.success("Program created")
      return data.id
    } catch (error) {
      console.error("Failed to create program:", error)
      toast.error("Failed to create audit program")
      return undefined
    }
  },

  updateProgram: async (id, updatedProgram) => {
    try {
      const dbUpdate: Record<string, any> = {}
      if (updatedProgram.title !== undefined) dbUpdate.title = updatedProgram.title
      if (updatedProgram.description !== undefined) dbUpdate.description = updatedProgram.description
      if (updatedProgram.status !== undefined) dbUpdate.status = updatedProgram.status

      const { error } = await supabase
        .from('audit_programs')
        .update(dbUpdate)
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        programs: state.programs.map((p) => (p.id === id ? { ...p, ...updatedProgram } : p)),
      }))
    } catch (error) {
      console.error("Failed to update program:", error)
      toast.error("Failed to update program")
    }
  },

  // ============================================================
  // PROCEDURES
  // ============================================================
  fetchProcedures: async (programId: string) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('audit_procedures')
        .select('*')
        .eq('program_id', programId)
        .eq('is_deleted', false)
        .order('step_number', { ascending: true })

      if (error) throw error

      const formatted = (data || []).map(d => ({
        id: d.id,
        programId: d.program_id,
        stepNumber: d.step_number,
        description: d.description,
        isMandatory: d.is_mandatory,
        status: d.status as ProcedureStatus,
        conclusion: d.conclusion || "",
        testedBy: d.tested_by,
        testedAt: d.tested_at,
        organization_id: d.organization_id,
      }))
      
      set({ procedures: formatted, isLoading: false })
    } catch (error) {
      console.error("Failed to fetch procedures:", error)
      toast.error("Failed to load procedures")
      set({ isLoading: false })
    }
  },

  addProcedure: async (procedure) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return undefined

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userData.user.id)
        .single()

      const newProcedure: Record<string, any> = {
        program_id: procedure.programId,
        step_number: procedure.stepNumber,
        description: procedure.description,
        is_mandatory: procedure.isMandatory,
        status: procedure.status,
        organization_id: profile?.organization_id || null
      }

      const { data, error } = await supabase
        .from('audit_procedures')
        .insert([newProcedure])
        .select()
        .single()

      if (error) throw error

      const formatted = {
        id: data.id,
        programId: data.program_id,
        stepNumber: data.step_number,
        description: data.description,
        isMandatory: data.is_mandatory,
        status: data.status as ProcedureStatus,
        conclusion: data.conclusion || "",
        testedBy: data.tested_by,
        testedAt: data.tested_at,
        organization_id: data.organization_id,
      }

      set((state) => ({ procedures: [...state.procedures, formatted] }))
      toast.success("Procedure added")
      return data.id
    } catch (error) {
      console.error("Failed to add procedure:", error)
      toast.error("Failed to add procedure")
      return undefined
    }
  },

  updateProcedure: async (id, updatedProc) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const dbUpdate: Record<string, any> = {}
      
      if (updatedProc.stepNumber !== undefined) dbUpdate.step_number = updatedProc.stepNumber
      if (updatedProc.description !== undefined) dbUpdate.description = updatedProc.description
      if (updatedProc.isMandatory !== undefined) dbUpdate.is_mandatory = updatedProc.isMandatory
      if (updatedProc.status !== undefined) dbUpdate.status = updatedProc.status
      if (updatedProc.conclusion !== undefined) dbUpdate.conclusion = updatedProc.conclusion
      
      // If status changed to Passed/Failed, auto-stamp the tester
      if (updatedProc.status === ProcedureStatus.Passed || updatedProc.status === ProcedureStatus.Failed) {
        dbUpdate.tested_by = userData.user?.id
        dbUpdate.tested_at = new Date().toISOString()
        updatedProc.testedBy = userData.user?.id
        updatedProc.testedAt = dbUpdate.tested_at
      }

      const { error } = await supabase
        .from('audit_procedures')
        .update(dbUpdate)
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        procedures: state.procedures.map((p) => (p.id === id ? { ...p, ...updatedProc } : p)),
      }))
      
      // Don't toast on every keystroke, only status changes
      if (updatedProc.status) {
         toast.success("Procedure status updated")
      }
    } catch (error) {
      console.error("Failed to update procedure:", error)
      toast.error("Failed to update procedure")
    }
  },

  // ============================================================
  // EVIDENCE
  // ============================================================
  fetchEvidence: async (procedureId: string) => {
    try {
      const { data, error } = await supabase
        .from('audit_evidence')
        .select('*')
        .eq('procedure_id', procedureId)
        .eq('is_deleted', false)

      if (error) throw error

      const formatted = (data || []).map(d => ({
        id: d.id,
        procedureId: d.procedure_id,
        workpaperId: d.workpaper_id,
        notes: d.notes || "",
        linkedBy: d.linked_by,
        organization_id: d.organization_id,
      }))
      
      // We append/merge rather than replace since we might be viewing multiple procedures
      set((state) => {
        const otherEvidence = state.evidence.filter(e => e.procedureId !== procedureId)
        return { evidence: [...otherEvidence, ...formatted] }
      })
    } catch (error) {
      console.error("Failed to fetch evidence:", error)
    }
  },

  linkEvidence: async (evidence) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userData.user.id)
        .single()

      const newLink: Record<string, any> = {
        procedure_id: evidence.procedureId,
        workpaper_id: evidence.workpaperId,
        notes: evidence.notes || null,
        linked_by: userData.user.id,
        organization_id: profile?.organization_id || null
      }

      const { data, error } = await supabase
        .from('audit_evidence')
        .insert([newLink])
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error("This workpaper is already linked to this procedure")
          return
        }
        throw error
      }

      const formatted = {
        id: data.id,
        procedureId: data.procedure_id,
        workpaperId: data.workpaper_id,
        notes: data.notes || "",
        linkedBy: data.linked_by,
        organization_id: data.organization_id,
      }

      set((state) => ({ evidence: [...state.evidence, formatted] }))
      toast.success("Evidence linked")
    } catch (error) {
      console.error("Failed to link evidence:", error)
      toast.error("Failed to link evidence")
    }
  },

  unlinkEvidence: async (id: string) => {
    try {
      const { error } = await supabase
        .from('audit_evidence')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        evidence: state.evidence.filter((e) => e.id !== id),
      }))
      toast.success("Evidence unlinked")
    } catch (error) {
      console.error("Failed to unlink evidence:", error)
      toast.error("Failed to unlink evidence")
    }
  }
}))
