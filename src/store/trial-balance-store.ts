import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"

export interface Account {
  id: string
  trialBalanceId: string
  accountCode: string
  accountName: string
  unadjustedDebit: number
  unadjustedCredit: number
  adjustedDebit: number
  adjustedCredit: number
  finalBalance: number
  leadSchedule: string
}

export interface TrialBalance {
  id: string
  auditId: string
  periodStart: string
  periodEnd: string
  status: "Draft" | "Mapped" | "Finalized"
}

interface TrialBalanceState {
  trialBalances: TrialBalance[]
  accounts: Account[]
  isLoading: boolean
  fetchTrialBalances: () => Promise<void>
  fetchAccounts: (trialBalanceId: string) => Promise<void>
  uploadCSV: (auditId: string, csvData: any[]) => Promise<void>
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>
}

const supabase = createClient()

export const useTrialBalanceStore = create<TrialBalanceState>((set, get) => ({
  trialBalances: [],
  accounts: [],
  isLoading: false,
  
  fetchTrialBalances: async () => {
    set({ isLoading: true })
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      set({ trialBalances: [], isLoading: false })
      return
    }

    const { data, error } = await supabase
      .from('trial_balances')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      const formattedData = data.map(d => ({
        id: d.id,
        auditId: d.audit_id,
        periodStart: d.period_start,
        periodEnd: d.period_end,
        status: d.status || "Draft",
      }))
      set({ trialBalances: formattedData as TrialBalance[], isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },

  fetchAccounts: async (trialBalanceId: string) => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('trial_balance_id', trialBalanceId)
      .order('account_code', { ascending: true })

    if (!error && data) {
      const formattedData = data.map(d => ({
        id: d.id,
        trialBalanceId: d.trial_balance_id,
        accountCode: d.account_code,
        accountName: d.account_name,
        unadjustedDebit: Number(d.unadjusted_debit) || 0,
        unadjustedCredit: Number(d.unadjusted_credit) || 0,
        adjustedDebit: Number(d.adjusted_debit) || 0,
        adjustedCredit: Number(d.adjusted_credit) || 0,
        finalBalance: Number(d.final_balance) || 0,
        leadSchedule: d.lead_schedule || "",
      }))
      set({ accounts: formattedData as Account[], isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },

  uploadCSV: async (auditId: string, csvData: any[]) => {
    set({ isLoading: true })
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data: profile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', userData.user.id)
      .single()

    // 1. Create the Trial Balance record
    const newTb = {
      audit_id: auditId,
      period_start: "2026-01-01",
      period_end: "2026-12-31",
      status: "Mapped",
      organization_id: profile?.organization_id
    }

    const { data: tbData, error: tbError } = await supabase
      .from('trial_balances')
      .insert([newTb])
      .select()
      .single()

    if (tbError || !tbData) {
      set({ isLoading: false })
      return
    }

    // 2. Insert all the accounts
    const accountsToInsert = csvData.map(row => ({
      trial_balance_id: tbData.id,
      organization_id: profile?.organization_id,
      account_code: row.code,
      account_name: row.name,
      unadjusted_debit: row.debit || 0,
      unadjusted_credit: row.credit || 0,
      final_balance: (row.debit || 0) - (row.credit || 0),
      lead_schedule: row.lead || "Unmapped",
    }))

    const { error: accError } = await supabase
      .from('accounts')
      .insert(accountsToInsert)

    if (!accError) {
      await get().fetchTrialBalances()
      await get().fetchAccounts(tbData.id)
    } else {
      set({ isLoading: false })
    }
  },

  updateAccount: async (id: string, updatedAccount: Partial<Account>) => {
    const dbUpdate: any = {}
    if (updatedAccount.leadSchedule !== undefined) dbUpdate.lead_schedule = updatedAccount.leadSchedule
    if (updatedAccount.adjustedDebit !== undefined) dbUpdate.adjusted_debit = updatedAccount.adjustedDebit
    if (updatedAccount.adjustedCredit !== undefined) dbUpdate.adjusted_credit = updatedAccount.adjustedCredit
    
    // Recalculate final balance if adjustments change
    if (updatedAccount.adjustedDebit !== undefined || updatedAccount.adjustedCredit !== undefined) {
      const account = get().accounts.find(a => a.id === id)
      if (account) {
        const ad = updatedAccount.adjustedDebit ?? account.adjustedDebit
        const ac = updatedAccount.adjustedCredit ?? account.adjustedCredit
        dbUpdate.final_balance = account.unadjustedDebit - account.unadjustedCredit + ad - ac
      }
    }

    const { error } = await supabase
      .from('accounts')
      .update(dbUpdate)
      .eq('id', id)

    if (!error) {
      set((state) => ({
        accounts: state.accounts.map((acc) => {
          if (acc.id === id) {
            const newAcc = { ...acc, ...updatedAccount }
            newAcc.finalBalance = newAcc.unadjustedDebit - newAcc.unadjustedCredit + newAcc.adjustedDebit - newAcc.adjustedCredit
            return newAcc
          }
          return acc
        }),
      }))
    }
  },
}))
