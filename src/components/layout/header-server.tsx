import { createClient } from "@/lib/supabase/server"
import { HeaderClient } from "./header-client"

interface User {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  role: "student" | "moderator" | "admin"
}

export async function HeaderServer() {
  const supabase = await createClient()
  
  let user: User | null = null
  
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, role')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        user = {
          id: profile.id,
          email: profile.email || authUser.email || '',
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: profile.role as "student" | "moderator" | "admin"
        }
      } else {
        user = {
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name,
          avatar_url: authUser.user_metadata?.avatar_url,
          role: 'student'
        }
      }
    }
  } catch (error) {
    console.error('Error fetching user:', error)
  }

  return <HeaderClient user={user} />
}
