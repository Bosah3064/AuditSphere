import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface Audit {
  id: string
  organization_id: string
  title: string
  status: string
  description: string
  start_date: string
  end_date: string
}

export interface Risk {
  id: string
  organization_id: string
  title: string
  category: string
  impact: number
  likelihood: number
  status: string
}

export interface Finding {
  id: string
  organization_id: string
  audit_id: string
  title: string
  severity: string
  status: string
}

interface AppState {
  audits: Audit[]
  risks: Risk[]
  findings: Finding[]
  isLoading: boolean
  setAudits: (audits: Audit[]) => void
  setRisks: (risks: Risk[]) => void
  setFindings: (findings: Finding[]) => void
  setLoading: (loading: boolean) => void
  fetchAll: () => Promise<void>
}

const seedAudits: Audit[] = [
  { id: 'A-001', organization_id: 'demo', title: 'Q3 2026 Financial Controls', status: 'Fieldwork', description: '', start_date: '2026-06-01', end_date: '2026-08-15' },
  { id: 'A-002', organization_id: 'demo', title: 'IT General Controls Review', status: 'Planning', description: '', start_date: '2026-07-01', end_date: '2026-09-30' },
  { id: 'A-003', organization_id: 'demo', title: 'Revenue Recognition Audit', status: 'Review', description: '', start_date: '2026-04-01', end_date: '2026-06-30' },
  { id: 'A-004', organization_id: 'demo', title: 'Procurement Process Audit', status: 'Completed', description: '', start_date: '2026-01-15', end_date: '2026-03-31' },
  { id: 'A-005', organization_id: 'demo', title: 'Anti-Money Laundering Compliance', status: 'Fieldwork', description: '', start_date: '2026-05-01', end_date: '2026-07-31' },
  { id: 'A-006', organization_id: 'demo', title: 'IFRS 16 Lease Accounting', status: 'Planning', description: '', start_date: '2026-07-15', end_date: '2026-10-15' },
  { id: 'A-007', organization_id: 'demo', title: 'Cybersecurity Assessment', status: 'Completed', description: '', start_date: '2026-03-01', end_date: '2026-05-31' },
  { id: 'A-008', organization_id: 'demo', title: 'Payroll Controls Review', status: 'Fieldwork', description: '', start_date: '2026-06-15', end_date: '2026-08-31' },
]

const seedRisks: Risk[] = [
  { id: 'R-001', organization_id: 'demo', title: 'Revenue Misstatement Risk', category: 'Financial', impact: 5, likelihood: 3, status: 'Open' },
  { id: 'R-002', organization_id: 'demo', title: 'Ransomware Attack Exposure', category: 'IT', impact: 5, likelihood: 4, status: 'Open' },
  { id: 'R-003', organization_id: 'demo', title: 'Regulatory Non-Compliance', category: 'Compliance', impact: 4, likelihood: 3, status: 'Mitigated' },
  { id: 'R-004', organization_id: 'demo', title: 'Procurement Fraud', category: 'Operational', impact: 4, likelihood: 2, status: 'Accepted' },
  { id: 'R-005', organization_id: 'demo', title: 'Foreign Exchange Exposure', category: 'Financial', impact: 3, likelihood: 4, status: 'Open' },
  { id: 'R-006', organization_id: 'demo', title: 'Data Privacy Breach (DPA 2019)', category: 'Compliance', impact: 5, likelihood: 2, status: 'Open' },
  { id: 'R-007', organization_id: 'demo', title: 'Key Person Dependency', category: 'Strategic', impact: 3, likelihood: 3, status: 'Open' },
  { id: 'R-008', organization_id: 'demo', title: 'Supplier Concentration Risk', category: 'Operational', impact: 3, likelihood: 2, status: 'Mitigated' },
]

const seedFindings: Finding[] = [
  { id: 'F-001', organization_id: 'demo', audit_id: 'A-001', title: 'Segregation of Duties Weakness in AP', severity: 'High', status: 'Open' },
  { id: 'F-002', organization_id: 'demo', audit_id: 'A-003', title: 'Unreconciled Intercompany Balances', severity: 'Critical', status: 'Open' },
  { id: 'F-003', organization_id: 'demo', audit_id: 'A-005', title: 'Incomplete KYC Documentation', severity: 'High', status: 'In Remediation' },
  { id: 'F-004', organization_id: 'demo', audit_id: 'A-007', title: 'Expired SSL Certificates on Production', severity: 'Critical', status: 'Open' },
  { id: 'F-005', organization_id: 'demo', audit_id: 'A-001', title: 'Manual Journal Entry Controls', severity: 'Medium', status: 'Open' },
  { id: 'F-006', organization_id: 'demo', audit_id: 'A-004', title: 'Vendor Duplicate Payments', severity: 'Low', status: 'Closed' },
]

export const useAppStore = create<AppState>((set) => ({
  audits: [],
  risks: [],
  findings: [],
  isLoading: false,
  setAudits: (audits) => set({ audits }),
  setRisks: (risks) => set({ risks }),
  setFindings: (findings) => set({ findings }),
  setLoading: (loading) => set({ isLoading: loading }),

  fetchAll: async () => {
    set({ isLoading: true })
    try {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No session')

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userData.user.id)
        .single()

      if (!profile?.organization_id) throw new Error('No org')

      const [auditsRes, risksRes, findingsRes] = await Promise.all([
        supabase.from('audits').select('*').eq('organization_id', profile.organization_id).eq('is_deleted', false),
        supabase.from('risks').select('*').eq('organization_id', profile.organization_id).eq('is_deleted', false),
        supabase.from('findings').select('*').eq('organization_id', profile.organization_id).eq('is_deleted', false),
      ])

      const audits = auditsRes.data || []
      const risks = risksRes.data || []
      const findings = findingsRes.data || []

      localStorage.setItem('app_audits_cache', JSON.stringify(audits))
      localStorage.setItem('app_risks_cache', JSON.stringify(risks))
      localStorage.setItem('app_findings_cache', JSON.stringify(findings))

      set({ audits, risks, findings, isLoading: false })
    } catch {
      // Try localStorage cache before falling back to seed data
      try {
        const cachedAudits = localStorage.getItem('app_audits_cache')
        const cachedRisks = localStorage.getItem('app_risks_cache')
        const cachedFindings = localStorage.getItem('app_findings_cache')

        if (cachedAudits || cachedRisks || cachedFindings) {
          set({
            audits: cachedAudits ? JSON.parse(cachedAudits) : seedAudits,
            risks: cachedRisks ? JSON.parse(cachedRisks) : seedRisks,
            findings: cachedFindings ? JSON.parse(cachedFindings) : seedFindings,
            isLoading: false,
          })
          return
        }
      } catch { /* ignore parse errors */ }

      set({
        audits: seedAudits,
        risks: seedRisks,
        findings: seedFindings,
        isLoading: false,
      })
    }
  }
}))
