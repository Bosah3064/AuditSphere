import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  organization_id: string
  full_name: string | null
  avatar_url: string | null
  role: string
}

export function useUser() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        if (mounted) setUser(session.user)
        
        // Fetch the extended profile
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          
        if (mounted && profileData) {
          setProfile(profileData)
        }
      }
      
      if (mounted) setIsLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          if (mounted) setUser(session.user)
          
          const { data: profileData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          if (mounted && profileData) {
            setProfile(profileData)
          }
        } else {
          if (mounted) {
            setUser(null)
            setProfile(null)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return { user, profile, isLoading }
}
