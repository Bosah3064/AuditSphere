"use client"

import * as React from "react"
import { useUser } from "@/hooks/use-user"
import { useRealtimeSync } from "@/hooks/use-realtime"

export function RealtimeProvider({ children }: { children?: React.ReactNode }) {
  const { profile } = useUser()
  
  // Connect global Zustand store to Supabase realtime channels
  useRealtimeSync(profile?.organization_id)

  return <>{children}</>
}
