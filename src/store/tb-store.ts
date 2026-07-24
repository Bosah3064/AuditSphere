import { create } from 'zustand'

export interface TBAccount {
  id: string
  code: string
  name: string
  unadjustedDebit: number
  unadjustedCredit: number
  adjustmentDebit: number
  adjustmentCredit: number
  adjustedDebit: number
  adjustedCredit: number
  group: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense"
}

interface TBState {
  accounts: TBAccount[]
  isLoading: boolean
  fetchAccounts: () => Promise<void>
  addAdjustment: (id: string, debit: number, credit: number) => Promise<void>
  setAccounts: (accounts: TBAccount[]) => void
}

const mockTB: TBAccount[] = [
  { id: "tb1", code: "1000", name: "Cash and Cash Equivalents", unadjustedDebit: 1500000, unadjustedCredit: 0, adjustmentDebit: 0, adjustmentCredit: 0, adjustedDebit: 1500000, adjustedCredit: 0, group: "Asset" },
  { id: "tb2", code: "1200", name: "Accounts Receivable", unadjustedDebit: 850000, unadjustedCredit: 0, adjustmentDebit: 0, adjustmentCredit: 50000, adjustedDebit: 800000, adjustedCredit: 0, group: "Asset" },
  { id: "tb3", code: "1500", name: "Property, Plant & Equipment", unadjustedDebit: 5200000, unadjustedCredit: 0, adjustmentDebit: 120000, adjustmentCredit: 0, adjustedDebit: 5320000, adjustedCredit: 0, group: "Asset" },
  { id: "tb4", code: "2000", name: "Accounts Payable", unadjustedDebit: 0, unadjustedCredit: 420000, adjustmentDebit: 0, adjustmentCredit: 15000, adjustedDebit: 0, adjustedCredit: 435000, group: "Liability" },
  { id: "tb5", code: "2500", name: "Long-Term Debt", unadjustedDebit: 0, unadjustedCredit: 2000000, adjustmentDebit: 0, adjustmentCredit: 0, adjustedDebit: 0, adjustedCredit: 2000000, group: "Liability" },
  { id: "tb6", code: "3000", name: "Common Stock", unadjustedDebit: 0, unadjustedCredit: 1000000, adjustmentDebit: 0, adjustmentCredit: 0, adjustedDebit: 0, adjustedCredit: 1000000, group: "Equity" },
  { id: "tb7", code: "3500", name: "Retained Earnings", unadjustedDebit: 0, unadjustedCredit: 3130000, adjustmentDebit: 0, adjustmentCredit: 0, adjustedDebit: 0, adjustedCredit: 3130000, group: "Equity" },
  { id: "tb8", code: "4000", name: "Revenue", unadjustedDebit: 0, unadjustedCredit: 2500000, adjustmentDebit: 0, adjustmentCredit: 55000, adjustedDebit: 0, adjustedCredit: 2555000, group: "Revenue" },
  { id: "tb9", code: "5000", name: "Cost of Goods Sold", unadjustedDebit: 1200000, unadjustedCredit: 0, adjustmentDebit: 0, adjustmentCredit: 0, adjustedDebit: 1200000, adjustedCredit: 0, group: "Expense" },
  { id: "tb10", code: "6000", name: "Operating Expenses", unadjustedDebit: 300000, unadjustedCredit: 0, adjustmentDebit: 0, adjustmentCredit: 0, adjustedDebit: 300000, adjustedCredit: 0, group: "Expense" },
]

export const useTBStore = create<TBState>((set) => ({
  accounts: [],
  isLoading: false,

  fetchAccounts: async () => {
    set({ isLoading: true })
    // Try to load from localStorage first
    const cached = localStorage.getItem('tb_accounts_cache')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed.length > 0) {
          set({ accounts: parsed, isLoading: false })
          return
        }
      } catch { /* ignore */ }
    }
    setTimeout(() => {
      set((state) => {
        const accounts = state.accounts.length > 0 ? state.accounts : mockTB
        localStorage.setItem('tb_accounts_cache', JSON.stringify(accounts))
        return { accounts, isLoading: false }
      })
    }, 600)
  },

  setAccounts: (accounts) => {
    localStorage.setItem('tb_accounts_cache', JSON.stringify(accounts))
    set({ accounts })
  },

  addAdjustment: async (id, debit, credit) => {
    set((state) => {
      const newAccounts = state.accounts.map(acc => {
        if (acc.id === id) {
          const newAdjDr = acc.adjustmentDebit + debit
          const newAdjCr = acc.adjustmentCredit + credit
          
          let newBalDr = acc.unadjustedDebit + newAdjDr - newAdjCr
          let newBalCr = acc.unadjustedCredit + newAdjCr - newAdjDr

          if (acc.group === "Asset" || acc.group === "Expense") {
             // Normal Debit Balance
             if (newBalDr < 0) {
               newBalCr = Math.abs(newBalDr)
               newBalDr = 0
             } else {
               newBalCr = 0
             }
          } else {
             // Normal Credit Balance
             if (newBalCr < 0) {
               newBalDr = Math.abs(newBalCr)
               newBalCr = 0
             } else {
               newBalDr = 0
             }
          }

          return {
            ...acc,
            adjustmentDebit: newAdjDr,
            adjustmentCredit: newAdjCr,
            adjustedDebit: newBalDr,
            adjustedCredit: newBalCr
          }
        }
        return acc
      })

      localStorage.setItem('tb_accounts_cache', JSON.stringify(newAccounts))
      return { accounts: newAccounts }
    })
  }
}))
