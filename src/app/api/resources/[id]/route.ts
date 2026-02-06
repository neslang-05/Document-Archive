import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { getD1, now } from "@/lib/db/d1"
import { deleteFiles, extractKeyFromUrl } from "@/lib/storage/r2"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getD1()

  // Verify ownership or admin role
  const resource = await db
    .prepare("SELECT uploader_id FROM resources WHERE id = ?")
    .bind(id)
    .first<{ uploader_id: string }>()

  if (!resource) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (resource.uploader_id !== currentUser.firebaseUser.uid && !["admin", "moderator"].includes(currentUser.profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Get associated files  
  const { results: files } = await db
    .prepare("SELECT file_url FROM resource_files WHERE resource_id = ?")
    .bind(id)
    .all()

  // Delete files from R2
  if (files && files.length > 0) {
    const keys = files
      .map((f: Record<string, unknown>) => extractKeyFromUrl(f.file_url as string))
      .filter((k): k is string => k !== null)

    if (keys.length > 0) {
      try {
        await deleteFiles(keys)
      } catch (err) {
        console.error("Error deleting R2 files:", err)
      }
    }
  }

  // Delete resource_files then resource
  await db.prepare("DELETE FROM resource_files WHERE resource_id = ?").bind(id).run()
  await db.prepare("DELETE FROM resources WHERE id = ?").bind(id).run()

  return NextResponse.json({ success: true })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getD1()

  const resource = await db
    .prepare(`
      SELECT r.*, c.code as course_code, c.name as course_name, c.semester as course_semester,
             p.full_name as uploader_name, p.email as uploader_email
      FROM resources r
      LEFT JOIN courses c ON r.course_id = c.id
      LEFT JOIN profiles p ON r.uploader_id = p.id
      WHERE r.id = ?
    `)
    .bind(id)
    .first()

  if (!resource) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { results: files } = await db
    .prepare("SELECT * FROM resource_files WHERE resource_id = ? ORDER BY file_order")
    .bind(id)
    .all()

  return NextResponse.json({ ...resource, files: files || [] })
}
