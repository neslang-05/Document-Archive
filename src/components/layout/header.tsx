"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { HeaderClient } from "./header-client"

interface User {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  role: "student" | "moderator" | "admin"
}

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, email, full_name, avatar_url, role')
            .eq('id', authUser.id)
            .single()

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email || authUser.email || '',
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              role: profile.role as "student" | "moderator" | "admin"
            })
          } else {
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name,
              avatar_url: authUser.user_metadata?.avatar_url,
              role: 'student'
            })
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Show minimal header while loading
  if (isLoading) {
    return <HeaderClient user={null} />
  }

  return <HeaderClient user={user} />
}