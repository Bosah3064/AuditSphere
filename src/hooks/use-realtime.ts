import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'

export function useRealtimeSync(organizationId?: string) {
  const supabase = createClient()
  const setAudits = useAppStore((state) => state.setAudits)
  const setRisks = useAppStore((state) => state.setRisks)
  const setFindings = useAppStore((state) => state.setFindings)

  useEffect(() => {
    if (!organizationId) return

    // Fetch initial data
    const fetchInitialData = async () => {
      const [auditsRes, risksRes, findingsRes] = await Promise.all([
        supabase.from('audits').select('*').eq('organization_id', organizationId),
        supabase.from('risks').select('*').eq('organization_id', organizationId),
        supabase.from('findings').select('*').eq('organization_id', organizationId),
      ])

      if (auditsRes.data) setAudits(auditsRes.data)
      if (risksRes.data) setRisks(risksRes.data)
      if (findingsRes.data) setFindings(findingsRes.data)
    }

    fetchInitialData()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'audits', filter: `organization_id=eq.${organizationId}` },
        (payload) => {
          console.log('Audits change received!', payload)
          fetchInitialData() // Simplest way to sync is refetch, or we can optimally mutate the store
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'risks', filter: `organization_id=eq.${organizationId}` },
        (payload) => {
          console.log('Risks change received!', payload)
          fetchInitialData()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'findings', filter: `organization_id=eq.${organizationId}` },
        (payload) => {
          console.log('Findings change received!', payload)
          fetchInitialData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId, setAudits, setRisks, setFindings, supabase])
}
