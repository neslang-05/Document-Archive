import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { getD1, now } from "@/lib/db/d1"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!["moderator", "admin"].includes(currentUser.profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { action, rejectionReason } = body

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const db = getD1()
  const timestamp = now()

  if (action === "approve") {
    await db
      .prepare(`UPDATE resources SET status = 'approved', approved_by = ?, approved_at = ?, updated_at = ? WHERE id = ?`)
      .bind(currentUser.firebaseUser.uid, timestamp, timestamp, id)
      .run()
  } else {
    await db
      .prepare(`UPDATE resources SET status = 'rejected', approved_by = ?, approved_at = ?, rejection_reason = ?, updated_at = ? WHERE id = ?`)
      .bind(currentUser.firebaseUser.uid, timestamp, rejectionReason || "", timestamp, id)
      .run()
  }

  return NextResponse.json({ success: true })
}
