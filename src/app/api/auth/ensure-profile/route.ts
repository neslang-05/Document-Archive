import { NextRequest, NextResponse } from "next/server"
import { verifyIdToken } from "@/lib/firebase/admin"
import { getD1, upsertProfile } from "@/lib/db/d1"
import { verifyTurnstileToken } from "@/lib/turnstile"

/**
 * POST /api/auth/ensure-profile
 * Ensures a profile exists in D1 for the authenticated Firebase user.
 * Replaces the Supabase `handle_new_user` trigger.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the session cookie
    const sessionCookie = request.cookies.get("__session")?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify the token
    const decoded = await verifyIdToken(sessionCookie)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))

    // Verify Turnstile token
    if (body.turnstileToken !== "google-oauth") {
      const isValid = await verifyTurnstileToken(body.turnstileToken)
      if (!isValid) {
        return NextResponse.json({ error: "Invalid Turnstile challenge. Please try again." }, { status: 403 })
      }
    }

    // Upsert the profile in D1
    const db = getD1()
    try {
      await upsertProfile(db, {
        id: decoded.uid,
        email: decoded.email || "",
        full_name: body.fullName || decoded.name || undefined,
        avatar_url: decoded.picture || undefined,
      })
    } catch (dbError) {
      console.error("D1 Profile Update Error:", dbError)
      return NextResponse.json({ error: "Failed to update user profile in database." }, { status: 500 })
    }

    return NextResponse.json({ status: "ok", uid: decoded.uid })
  } catch (error) {
    console.error("Error ensuring profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
