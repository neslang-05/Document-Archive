"use client"

import { useEffect, useState } from "react"
import { auth, onAuthStateChanged } from "@/lib/firebase/client"
import { HeaderClient } from "./header-client"

interface User {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  role: "student" | "moderator" | "admin"
}

// Client-side header that fetches user on mount (used in client pages)
export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch profile from API
          const res = await fetch("/api/user/profile")
          if (res.ok) {
            const profile = await res.json()
            setUser({
              id: profile.id,
              email: profile.email || firebaseUser.email || '',
              full_name: profile.full_name || firebaseUser.displayName,
              avatar_url: profile.avatar_url || firebaseUser.photoURL,
              role: profile.role as "student" | "moderator" | "admin"
            })
          } else {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              full_name: firebaseUser.displayName,
              avatar_url: firebaseUser.photoURL,
              role: 'student'
            })
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            full_name: firebaseUser.displayName,
            avatar_url: firebaseUser.photoURL,
            role: 'student'
          })
        }
      } else {
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  return <HeaderClient user={user} />
}