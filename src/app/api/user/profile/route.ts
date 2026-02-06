import { NextRequest, NextResponse } from "next/server"
import { verifyIdToken } from "@/lib/firebase/admin"
import { getD1, getProfile, now } from "@/lib/db/d1"

/**
 * GET /api/user/profile
 * Returns the current user's profile from D1.
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("__session")?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = await verifyIdToken(sessionCookie)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const db = getD1()
    const profile = await getProfile(db, decoded.uid)

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user/profile
 * Update the current user's profile.
 */
export async function PATCH(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("__session")?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = await verifyIdToken(sessionCookie)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()
    const db = getD1()

    await db
      .prepare("UPDATE profiles SET full_name = ?, updated_at = ? WHERE id = ?")
      .bind(body.full_name || null, now(), decoded.uid)
      .run()

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
