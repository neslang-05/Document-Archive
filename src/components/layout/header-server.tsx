import { getCurrentUser } from "@/lib/auth/session"
import { HeaderClient } from "./header-client"

interface User {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  role: "student" | "moderator" | "admin"
}

export async function HeaderServer() {
  let user: User | null = null
  
  try {
    const currentUser = await getCurrentUser()

    if (currentUser) {
      user = {
        id: currentUser.profile.id,
        email: currentUser.profile.email,
        full_name: currentUser.profile.full_name,
        avatar_url: currentUser.profile.avatar_url,
        role: currentUser.profile.role as "student" | "moderator" | "admin"
      }
    }
  } catch (error) {
    console.error('Error fetching user:', error)
  }

  return <HeaderClient user={user} />
}
