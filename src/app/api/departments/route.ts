import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { getD1, generateId, now } from "@/lib/db/d1"

export async function GET() {
  const db = getD1()
  const { results } = await db
    .prepare("SELECT id, code, name, description FROM departments ORDER BY code")
    .all()
  return NextResponse.json(results || [])
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { code, name, description } = body

  if (!code?.trim() || !name?.trim()) {
    return NextResponse.json({ error: "Code and name required" }, { status: 400 })
  }

  const db = getD1()
  const id = generateId()
  const timestamp = now()

  await db
    .prepare("INSERT INTO departments (id, code, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, code.trim().toUpperCase(), name.trim(), description?.trim() || null, timestamp, timestamp)
    .run()

  const dept = await db.prepare("SELECT * FROM departments WHERE id = ?").bind(id).first()
  return NextResponse.json(dept)
}

export async function PUT(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { id, code, name, description } = body

  if (!id || !code?.trim() || !name?.trim()) {
    return NextResponse.json({ error: "ID, code and name required" }, { status: 400 })
  }

  const db = getD1()
  await db
    .prepare("UPDATE departments SET code = ?, name = ?, description = ?, updated_at = ? WHERE id = ?")
    .bind(code.trim().toUpperCase(), name.trim(), description?.trim() || null, now(), id)
    .run()

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }

  const db = getD1()
  await db.prepare("DELETE FROM departments WHERE id = ?").bind(id).run()

  return NextResponse.json({ success: true })
}
