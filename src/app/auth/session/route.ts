import { NextRequest, NextResponse } from "next/server"
import { verifyIdToken } from "@/lib/firebase/admin"

const SESSION_COOKIE_NAME = "__session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 5 // 5 days

/**
 * POST /auth/session
 * Set a session cookie from a Firebase ID token.
 * Called by the client after successful Firebase login.
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Missing idToken" },
        { status: 400 }
      )
    }

    // Verify the token is valid
    const decoded = await verifyIdToken(idToken)
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    // Set the session cookie
    const response = NextResponse.json({ status: "ok", uid: decoded.uid })
    response.cookies.set(SESSION_COOKIE_NAME, idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Session creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /auth/session
 * Clear the session cookie (logout).
 */
export async function DELETE() {
  const response = NextResponse.json({ status: "ok" })
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
  return response
}
