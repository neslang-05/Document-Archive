import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { getD1 } from "@/lib/db/d1"
import type { UserRole } from "@/types/database"

export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { userId, role } = body as { userId: string; role: UserRole }

  if (!userId || !role) {
    return NextResponse.json({ error: "userId and role required" }, { status: 400 })
  }

  const validRoles: UserRole[] = ["user", "moderator", "admin"]
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const db = getD1()
  await db
    .prepare("UPDATE profiles SET role = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(role, userId)
    .run()

  return NextResponse.json({ success: true })
}
