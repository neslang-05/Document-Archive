import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { getD1, generateId, now } from "@/lib/db/d1"

export async function GET() {
  const db = getD1()
  const { results } = await db
    .prepare(`
      SELECT c.*, d.code as dept_code, d.name as dept_name
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      ORDER BY c.code
    `)
    .all()

  const courses = (results || []).map((c: Record<string, unknown>) => ({
    ...c,
    departments: c.dept_code ? { code: c.dept_code, name: c.dept_name } : null,
  }))

  return NextResponse.json(courses)
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { code, name, semester, credits, department_id, description } = body

  if (!code?.trim() || !name?.trim() || !department_id) {
    return NextResponse.json({ error: "Code, name and department required" }, { status: 400 })
  }

  const db = getD1()
  const id = generateId()
  const timestamp = now()

  await db
    .prepare(`INSERT INTO courses (id, code, name, semester, credits, department_id, description, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, code.trim().toUpperCase(), name.trim(), semester || 1, credits || 3, department_id, description?.trim() || null, timestamp, timestamp)
    .run()

  // Return with department join
  const course = await db
    .prepare(`
      SELECT c.*, d.code as dept_code, d.name as dept_name
      FROM courses c LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.id = ?
    `)
    .bind(id)
    .first()

  const result = course ? {
    ...course,
    departments: course.dept_code ? { code: course.dept_code, name: course.dept_name } : null,
  } : null

  return NextResponse.json(result)
}

export async function PUT(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { id, code, name, semester, credits, department_id, description } = body

  if (!id || !code?.trim() || !name?.trim() || !department_id) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
  }

  const db = getD1()
  await db
    .prepare(`UPDATE courses SET code = ?, name = ?, semester = ?, credits = ?, department_id = ?, description = ?, updated_at = ? WHERE id = ?`)
    .bind(code.trim().toUpperCase(), name.trim(), semester || 1, credits || 3, department_id, description?.trim() || null, now(), id)
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
  await db.prepare("DELETE FROM courses WHERE id = ?").bind(id).run()

  return NextResponse.json({ success: true })
}
