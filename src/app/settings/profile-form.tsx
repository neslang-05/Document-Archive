"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  email: string
  full_name?: string | null
}

export function ProfileForm({ user }: { user: UserProfile }) {
  const [fullName, setFullName] = useState(user.full_name || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName }),
      })

      if (res.ok) {
        setMessage("Profile updated successfully")
        router.refresh()
      } else {
        setMessage("Error updating profile")
      }
    } catch {
      setMessage("Error updating profile")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={user.email} disabled />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input 
          id="fullName" 
          value={fullName} 
          onChange={(e) => setFullName(e.target.value)} 
          placeholder="Enter your full name"
        />
      </div>
      {message && (
        <p className={`text-sm ${message.includes("Error") ? "text-destructive" : "text-green-600"}`}>
          {message}
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
