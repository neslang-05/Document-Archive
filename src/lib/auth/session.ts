import { cookies } from "next/headers"
import { verifyIdToken, type DecodedIdToken } from "@/lib/firebase/admin"
import { getD1, getProfile, type ProfileRow } from "@/lib/db/d1"

const SESSION_COOKIE_NAME = "__session"

/**
 * Get the current authenticated user from the session cookie.
 * Used in server components and API routes.
 *
 * Returns the Firebase decoded token and the user's profile from D1.
 */
export async function getCurrentUser(): Promise<{
  firebaseUser: DecodedIdToken
  profile: ProfileRow
} | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionCookie) return null

    const decoded = await verifyIdToken(sessionCookie)
    if (!decoded) return null

    const db = getD1()
    const profile = await getProfile(db, decoded.uid)

    if (!profile) return null

    return { firebaseUser: decoded, profile }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Get just the Firebase UID from the session cookie.
 * Lighter-weight check when you don't need the full profile.
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionCookie) return null

    const decoded = await verifyIdToken(sessionCookie)
    return decoded?.uid ?? null
  } catch {
    return null
  }
}

/**
 * Get the user's role from the session.
 */
export async function getCurrentUserRole(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.profile.role ?? null
}
