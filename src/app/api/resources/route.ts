import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { getD1, generateId, now } from "@/lib/db/d1"
import { uploadFile } from "@/lib/storage/r2"
import type { ResourceCategory, ExamType } from "@/types/database"

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()

    const courseCode = formData.get("courseCode") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string | null
    const category = formData.get("category") as ResourceCategory
    const examType = formData.get("examType") as ExamType | null
    const year = parseInt(formData.get("year") as string, 10)

    if (!courseCode || !title || !category || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = getD1()

    // Look up course ID
    const course = await db
      .prepare("SELECT id FROM courses WHERE code = ?")
      .bind(courseCode)
      .first<{ id: string }>()

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Get all uploaded files
    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file_") && value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    const resourceId = generateId()
    const timestamp = now()
    const primaryFile = files[0]

    // Upload primary file to R2
    const primaryKey = `${currentUser.firebaseUser.uid}/${Date.now()}_${primaryFile.name}`
    const primaryBuffer = Buffer.from(await primaryFile.arrayBuffer())
    const primaryUrl = await uploadFile(primaryKey, primaryBuffer, primaryFile.type)

    // Insert resource record
    await db
      .prepare(`
        INSERT INTO resources (id, course_id, uploader_id, title, description, category,
          exam_type, year, file_url, file_name, file_size, file_type, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
      `)
      .bind(
        resourceId, course.id, currentUser.firebaseUser.uid, title.trim(),
        description?.trim() || null, category, examType || null, year,
        primaryUrl, primaryFile.name, primaryFile.size, primaryFile.type,
        timestamp, timestamp
      )
      .run()

    // Upload all files and create resource_files entries
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const key = `${currentUser.firebaseUser.uid}/${resourceId}/${Date.now()}_${i}_${file.name}`
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileUrl = await uploadFile(key, buffer, file.type)

      const fileId = generateId()
      await db
        .prepare(`
          INSERT INTO resource_files (id, resource_id, file_url, file_name, file_size, file_type, file_order, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(fileId, resourceId, fileUrl, file.name, file.size, file.type, i, timestamp)
        .run()
    }

    return NextResponse.json({ success: true, resourceId })
  } catch (error) {
    console.error("Submit error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
