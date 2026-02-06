import { NextRequest, NextResponse } from "next/server"
import { getD1 } from "@/lib/db/d1"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getD1()
  const courseId = decodeURIComponent(id)

  // Try by ID or code
  let course = await db
    .prepare(`
      SELECT c.*, d.code as dept_code, d.name as dept_name
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.id = ? OR c.code = ?
    `)
    .bind(courseId, courseId)
    .first()

  // Case-insensitive fallback
  if (!course) {
    course = await db
      .prepare(`
        SELECT c.*, d.code as dept_code, d.name as dept_name
        FROM courses c
        LEFT JOIN departments d ON c.department_id = d.id
        WHERE UPPER(c.code) = UPPER(?)
      `)
      .bind(courseId)
      .first()
  }

  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Fetch resources for this course
  const { results: resources } = await db
    .prepare(`
      SELECT r.id, r.title, r.category, r.exam_type, r.year, r.created_at,
             r.download_count, r.average_rating, r.uploader_id,
             c.code as course_code, c.name as course_name
      FROM resources r
      LEFT JOIN courses c ON r.course_id = c.id
      WHERE r.course_id = ? AND r.status = 'approved'
      ORDER BY r.created_at DESC
    `)
    .bind(course.id as string)
    .all()

  return NextResponse.json({
    course,
    resources: resources || [],
  })
}
