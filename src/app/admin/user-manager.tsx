"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import type { UserRole } from "@/types/database"

interface User {
  id: string
  email: string
  full_name?: string | null
  role: UserRole
  created_at: string
}

interface UserManagerProps {
  users: User[]
}

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  moderator: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  user: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  guest: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-500",
}

export function UserManager({ users: initialUsers }: UserManagerProps) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId)

    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    })

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
    }

    setUpdatingUserId(null)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage user roles and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {(user.full_name || user.email || "?")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.full_name || "Unnamed User"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {updatingUserId === user.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Badge variant="secondary" className={roleColors[user.role]}>
                  {user.role}
                </Badge>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No users found.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
